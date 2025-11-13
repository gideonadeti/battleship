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

    // Find a random cell that hasn't been attacked
    do {
      x = Math.floor(Math.random() * BOARD_SIZE);
      y = Math.floor(Math.random() * BOARD_SIZE);
      cell = document.querySelector(
        `.player .game-board .cell[data-row="${x + 1}"][data-col="${y + 1}"]`
      );
    } while (!cell || cell.classList.contains("attacked"));

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
      if (adjacentCell && !adjacentCell.classList.contains("attacked")) {
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

    playSound(sound);
    UI.showGameOverModal(outcome);
    UI.updateNotification(outcome);
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
   * Cleanup resources
   */
  cleanup() {
    this.reset();
  }
}
