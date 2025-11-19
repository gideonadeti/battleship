import playSound from "../models/sounds";
import GameState from "./game-state";
import ComputerAI from "../ai/computer-ai";
import UI from "../views/ui";
import { GAME_STATES, PLAYERS, BOARD_SIZE } from "../constants/game-constants";

/**
 * GameController manages the game flow and state
 */
export default class GameController {
  constructor(player, computer) {
    this.player = player;
    this.computer = computer;
    this.gameState = new GameState();
    this.computerAI = new ComputerAI();
    this.handlePlayerAttackBound = this.handlePlayerAttack.bind(this);
    this.computerTimeout = null;
    this.computerShip = null;
    this.playerShip = null;
    this.startTime = null;
  }

  /**
   * Initialize the game
   */
  initialize() {
    // Randomly determine starting player
    const startingPlayer =
      Math.random() > 0.5 ? PLAYERS.PLAYER : PLAYERS.COMPUTER;
    this.gameState.setCurrentPlayer(startingPlayer);
    this.gameState.setState(GAME_STATES.PLAYING);
    this.startTime = Date.now();

    playSound("gameStarted");
    UI.updateNotification(
      startingPlayer === PLAYERS.PLAYER
        ? "The game started, your turn."
        : "The game started, computer's turn."
    );

    // Add event listener for player attacks
    UI.computerBoard.addEventListener("click", this.handlePlayerAttackBound);

    // If computer starts, make first move
    if (startingPlayer === PLAYERS.COMPUTER) {
      this.scheduleComputerAttack();
    }
  }

  /**
   * Handle player attack
   * @param {Event} event - Click event
   */
  handlePlayerAttack(event) {
    if (!this.gameState.isState(GAME_STATES.PLAYING)) {
      return;
    }

    if (this.gameState.getCurrentPlayer() !== PLAYERS.PLAYER) {
      return;
    }

    const cell = event.target;
    if (
      !cell.classList.contains("cell") ||
      cell.classList.contains("attacked") ||
      cell.classList.contains("label")
    ) {
      return;
    }

    const x = parseInt(cell.dataset.row, 10) - 1;
    const y = parseInt(cell.dataset.col, 10) - 1;
    const hit = this.player.attack(this.computer, x, y);

    if (hit) {
      this.computerShip = this.computer.gameBoard.board[x][y];
    }

    UI.fillCell(cell, hit);

    const sound = hit
      ? this.computerShip.isSunk()
        ? "killed"
        : "wounded"
      : "missed";
    playSound(sound);

    // Mark verified empty cells if ship is sunk
    if (hit && this.computerShip && this.computerShip.isSunk()) {
      this.markVerifiedEmptyCellsForSunkShip(
        this.computerShip,
        this.computer.gameBoard,
        UI.computerBoard
      );
    }

    // Check if all computer ships are sunk
    if (this.computer.gameBoard.areAllShipsSunk()) {
      this.endGame(PLAYERS.PLAYER);
      return;
    }

    // If miss, switch to computer's turn
    if (!hit) {
      this.gameState.setCurrentPlayer(PLAYERS.COMPUTER);
      UI.updateNotification("Computer's turn, please wait.");
      // Continue with smart attack if we have a target ship, otherwise random
      this.scheduleComputerAttack();
    }
  }

  /**
   * Schedule computer attack with delay
   */
  scheduleComputerAttack() {
    // Clear any existing timeout
    if (this.computerTimeout) {
      clearTimeout(this.computerTimeout);
    }

    // Use smart attack delay if we have a target ship
    const isSmartAttack = this.computerAI.targetShip !== null;
    const delay = this.computerAI.getDelayTime(isSmartAttack);
    this.computerTimeout = setTimeout(() => {
      if (
        isSmartAttack &&
        this.computerAI.targetShip &&
        !this.computerAI.targetShip.isSunk()
      ) {
        this.executeSmartComputerAttack();
      } else {
        this.executeComputerAttack();
      }
    }, delay);
  }

  /**
   * Execute random computer attack
   */
  executeComputerAttack() {
    if (!this.gameState.isState(GAME_STATES.PLAYING)) {
      return;
    }

    if (this.gameState.getCurrentPlayer() !== PLAYERS.COMPUTER) {
      return;
    }

    let x, y, cell;
    let attempts = 0;
    const maxAttempts = BOARD_SIZE * BOARD_SIZE;

    // Find a random cell that hasn't been attacked and isn't verified empty
    do {
      x = Math.floor(Math.random() * BOARD_SIZE);
      y = Math.floor(Math.random() * BOARD_SIZE);
      cell = document.querySelector(
        `.player .game-board .cell[data-row="${x + 1}"][data-col="${y + 1}"]`
      );
      attempts++;
      // Prevent infinite loop
      if (attempts > maxAttempts) {
        // Fallback: find any unattacked cell
        for (let i = 0; i < BOARD_SIZE; i++) {
          for (let j = 0; j < BOARD_SIZE; j++) {
            const fallbackCell = document.querySelector(
              `.player .game-board .cell[data-row="${i + 1}"][data-col="${j + 1}"]`
            );
            if (
              fallbackCell &&
              !fallbackCell.classList.contains("attacked") &&
              !this.player.gameBoard.isVerifiedEmpty(i, j)
            ) {
              x = i;
              y = j;
              cell = fallbackCell;
              break;
            }
          }
          if (cell && !cell.classList.contains("attacked")) break;
        }
        break;
      }
    } while (
      !cell ||
      cell.classList.contains("attacked") ||
      this.player.gameBoard.isVerifiedEmpty(x, y)
    );

    // Safety check: if cell is still null, something is wrong with the DOM
    if (!cell) {
      console.error("Could not find cell in DOM");
      this.gameState.setCurrentPlayer(PLAYERS.PLAYER);
      UI.updateNotification("Your turn.");
      return;
    }

    const hit = this.computer.attack(this.player, x, y);
    UI.fillCell(cell, hit);
    playSound(hit ? "wounded" : "missed");

    if (hit) {
      const playerShip = this.player.gameBoard.board[x][y];
      this.playerShip = playerShip;
      this.computerAI.prepareSmartAttack(x, y, playerShip);
      // Continue with smart attack
      this.scheduleComputerAttack();
    } else {
      this.gameState.setCurrentPlayer(PLAYERS.PLAYER);
      UI.updateNotification("Your turn.");
    }
  }

  /**
   * Execute smart computer attack
   */
  executeSmartComputerAttack() {
    if (!this.gameState.isState(GAME_STATES.PLAYING)) {
      return;
    }

    if (this.gameState.getCurrentPlayer() !== PLAYERS.COMPUTER) {
      return;
    }

    if (!this.computerAI.targetShip || this.computerAI.targetShip.isSunk()) {
      // Ship sunk, go back to random attacks
      this.computerAI.resetSmartAttack();
      this.playerShip = null;
      // Schedule a new random attack with delay
      this.scheduleComputerAttack();
      return;
    }

    const { dx, dy } = this.computerAI.getDirectionVector(
      this.computerAI.currentIndex
    );
    const adjacentX = this.computerAI.currentX + dx;
    const adjacentY = this.computerAI.currentY + dy;

    if (this.computerAI.isValidCell(adjacentX, adjacentY)) {
      const adjacentCell = document.querySelector(
        `.player .game-board .cell[data-row="${adjacentX + 1}"][data-col="${
          adjacentY + 1
        }"]`
      );
      if (
        adjacentCell &&
        !adjacentCell.classList.contains("attacked") &&
        !this.player.gameBoard.isVerifiedEmpty(adjacentX, adjacentY)
      ) {
        this.processSmartAttack(adjacentX, adjacentY, adjacentCell);
      } else {
        this.updateSmartAttackAfterInvalidMove();
      }
    } else {
      this.updateSmartAttackAfterInvalidMove();
    }
  }

  /**
   * Process smart attack
   */
  processSmartAttack(x, y, cell) {
    const hit = this.computer.attack(this.player, x, y);
    UI.fillCell(cell, hit);
    playSound(
      hit
        ? this.computerAI.targetShip.isSunk()
          ? "killed"
          : "wounded"
        : "missed"
    );

    // Mark verified empty cells if ship is sunk (internal tracking only)
    if (hit && this.computerAI.targetShip && this.computerAI.targetShip.isSunk()) {
      this.markVerifiedEmptyCellsForSunkShip(
        this.computerAI.targetShip,
        this.player.gameBoard,
        null // Don't visually mark player board
      );
    }

    if (this.player.gameBoard.areAllShipsSunk()) {
      this.endGame(PLAYERS.COMPUTER);
      return;
    }

    if (hit) {
      this.updateSmartAttackOnHit(x, y);
    } else {
      this.updateSmartAttackOnMiss();
    }
  }

  /**
   * Update state on smart attack hit
   */
  updateSmartAttackOnHit(x, y) {
    this.computerAI.updateSmartAttackOnHit(x, y);
    // Continue smart attack
    this.scheduleComputerAttack();
  }

  /**
   * Update state on smart attack miss
   */
  updateSmartAttackOnMiss() {
    this.computerAI.updateSmartAttackOnMiss();
    this.gameState.setCurrentPlayer(PLAYERS.PLAYER);
    UI.updateNotification("Your turn.");
  }

  /**
   * Update smart attack after invalid move
   */
  updateSmartAttackAfterInvalidMove() {
    this.computerAI.updateSmartAttackAfterInvalidMove();
    // Continue trying smart attack
    this.scheduleComputerAttack();
  }

  /**
   * End the game
   * @param {string} winner - The winner of the game
   */
  endGame(winner) {
    this.gameState.setWinner(winner);
    this.gameState.setState(GAME_STATES.GAME_OVER);

    // Clear computer timeout
    if (this.computerTimeout) {
      clearTimeout(this.computerTimeout);
      this.computerTimeout = null;
    }

    // Remove event listener
    UI.computerBoard.removeEventListener("click", this.handlePlayerAttackBound);

    const outcome = winner === PLAYERS.PLAYER ? "You won!" : "You lose!";
    const sound = winner === PLAYERS.PLAYER ? "win" : "lose";

    // Calculate game duration in seconds
    const duration = this.startTime
      ? Math.floor((Date.now() - this.startTime) / 1000)
      : 0;

    // Determine game outcome for API (WON or LOST)
    const gameOutcome = winner === PLAYERS.PLAYER ? "WON" : "LOST";

    playSound(sound);
    UI.showGameOverModal(outcome, {
      outcome: gameOutcome,
      duration,
    });
    UI.updateNotification(outcome);
    
    // Disable and hide cancel button when game ends
    UI.disableCancelButton();
    if (UI.cancelButton) {
      UI.cancelButton.style.display = "none";
    }
    
    // Re-enable Randomize button and change text to "New Game" to make it clear
    UI.enableRandomizeButton();
    UI.setRandomizeButtonText("New Game");
    
    // Show start button again and fade computer board for new game setup
    if (UI.startButton) {
      UI.startButton.style.display = "block";
    }
    // Fade computer board but keep it visible so players can see final state
    if (UI.computerBoard) {
      UI.computerBoard.style.opacity = 0.25;
      UI.computerBoard.style.pointerEvents = "none";
    }
    
    // The board is already non-interactive since we removed the click event listener above
  }

  /**
   * Reset the game controller
   */
  reset() {
    // Clear computer timeout
    if (this.computerTimeout) {
      clearTimeout(this.computerTimeout);
      this.computerTimeout = null;
    }

    // Remove event listener
    UI.computerBoard.removeEventListener("click", this.handlePlayerAttackBound);

    // Reset state
    this.gameState.reset();
    this.computerAI.reset();
    this.computerShip = null;
    this.playerShip = null;
  }

  /**
   * Mark verified empty cells around a sunk ship
   * @param {Object} ship - The sunk ship
   * @param {GameBoard} gameBoard - The game board
   * @param {HTMLElement|null} boardElement - The board DOM element (null for player board, computer board for visual marking)
   */
  markVerifiedEmptyCellsForSunkShip(ship, gameBoard, boardElement) {
    const position = gameBoard.getShipPosition(ship);
    if (!position) {
      return;
    }

    const { x, y, orientation } = position;
    const length = ship.length;

    // Track verified empty cells internally
    gameBoard.markVerifiedEmptyCells(x, y, orientation, length);

    // Visually mark on computer board only (if checkbox is enabled)
    if (boardElement && UI.isMarkVerifiedEnabled()) {
      const adjacentCells = gameBoard.getAdjacentCells(x, y, orientation, length);
      for (const cell of adjacentCells) {
        // Check if cell has been missed (markVerifiedEmptyCell will also check for attacked class)
        const isMissed = gameBoard.missedAttacks.find((c) => c[0] === cell.x && c[1] === cell.y);
        
        // Only mark if not already missed (markVerifiedEmptyCell will check for attacked class to handle hits)
        if (!isMissed) {
          UI.markVerifiedEmptyCell(cell.x, cell.y, boardElement);
        }
      }
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.reset();
  }
}
