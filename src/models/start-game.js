import UI from "../views/ui";
import playSound from "./sounds";
import GameState from "../game/game-state";
import ComputerAI from "../ai/computer-ai";
import {
  BOARD_SIZE,
  PLAYERS,
  GAME_STATES,
} from "../constants/game-constants";

export default class StartGame {
  static gameState;
  static player;
  static computer;
  static handlePlayerAttackBound;
  static playerShip;
  static computerShip;
  static computerAI;

  // Initialize the game with random starter
  static initialize(player, computer) {
    this.player = player;
    this.computer = computer;
    this.gameState = new GameState();
    this.computerAI = new ComputerAI();
    const startingPlayer =
      Math.random() > 0.5 ? PLAYERS.PLAYER : PLAYERS.COMPUTER;
    this.gameState.setCurrentPlayer(startingPlayer);
    this.gameState.setState(GAME_STATES.PLAYING);

    playSound("gameStarted");
    UI.updateNotification(
      this.gameState.getCurrentPlayer() === PLAYERS.PLAYER
        ? "The game started, your turn."
        : "The game started, computer's turn."
    );

    if (this.gameState.getCurrentPlayer() === PLAYERS.COMPUTER) {
      setTimeout(() => this.handleComputerAttack(), this.computerAI.getDelayTime());
    }

    // Bind the player attack handler and add event listener
    this.handlePlayerAttackBound = this.handlePlayerAttack.bind(this);
    UI.computerBoard.addEventListener("click", this.handlePlayerAttackBound);
  }

  // Handle computer attack logic
  static handleComputerAttack() {
    if (
      !this.gameState ||
      this.gameState.getState() !== GAME_STATES.PLAYING ||
      this.gameState.getCurrentPlayer() !== PLAYERS.COMPUTER
    ) {
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
    } while (cell.classList.contains("attacked"));

    const hit = this.computer.attack(this.player, x, y);
    UI.fillCell(cell, hit);
    playSound(hit ? "wounded" : "missed");

    if (hit) {
      this.prepareSmartAttack(x, y, this.player.gameBoard.board[x][y]);
    } else {
      this.gameState.setCurrentPlayer(PLAYERS.PLAYER);
      UI.updateNotification("Your turn.");
    }
  }

  // Prepare smart attack
  static prepareSmartAttack(initialX, initialY, playerShip) {
    this.playerShip = playerShip;
    this.computerAI.prepareSmartAttack(initialX, initialY, playerShip);

    setTimeout(() => this.handleSmartComputerAttack(), this.computerAI.getDelayTime(true));
  }

  // Handle smart computer attack logic
  static handleSmartComputerAttack() {
    if (
      !this.gameState ||
      this.gameState.getState() !== GAME_STATES.PLAYING ||
      this.gameState.getCurrentPlayer() !== PLAYERS.COMPUTER
    ) {
      return;
    }

    if (this.computerAI.targetShip && !this.computerAI.targetShip.isSunk()) {
      const { dx, dy } = this.computerAI.getDirectionVector(this.computerAI.currentIndex);
      const adjacentX = this.computerAI.currentX + dx;
      const adjacentY = this.computerAI.currentY + dy;

      if (this.computerAI.isValidCell(adjacentX, adjacentY)) {
        const adjacentCell = document.querySelector(
          `.player .game-board .cell[data-row="${adjacentX + 1}"][data-col="${
            adjacentY + 1
          }"]`
        );
        if (!adjacentCell.classList.contains("attacked")) {
          this.processSmartAttack(adjacentX, adjacentY, adjacentCell);
        } else {
          this.updateSmartAttackAfterInvalidMove();
        }
      } else {
        this.updateSmartAttackAfterInvalidMove();
      }
    } else {
      this.handleComputerAttack();
    }
  }

  // Process smart attack
  static processSmartAttack(x, y, cell) {
    const hit = this.computer.attack(this.player, x, y);
    UI.fillCell(cell, hit);
    playSound(
      hit ? (this.computerAI.targetShip.isSunk() ? "killed" : "wounded") : "missed"
    );

    if (this.player.gameBoard.areAllShipsSunk()) {
      playSound("lose");
      this.gameState.setWinner(PLAYERS.COMPUTER);
      UI.showGameOverModal("You lose!");
      UI.updateNotification("You lose!");
      UI.computerBoard.removeEventListener(
        "click",
        this.handlePlayerAttackBound
      );
    } else {
      if (hit) {
        this.updateSmartAttackOnHit(x, y);
      } else {
        this.updateSmartAttackOnMiss();
      }
    }
  }

  // Update state on smart attack hit
  static updateSmartAttackOnHit(x, y) {
    this.computerAI.updateSmartAttackOnHit(x, y);

    setTimeout(() => this.handleSmartComputerAttack(), this.computerAI.getDelayTime(true));
  }

  // Update state on smart attack miss
  static updateSmartAttackOnMiss() {
    this.computerAI.updateSmartAttackOnMiss();
    this.gameState.setCurrentPlayer(PLAYERS.PLAYER);
    UI.updateNotification("Your turn.");
  }

  // Update smart attack after invalid move
  static updateSmartAttackAfterInvalidMove() {
    this.computerAI.updateSmartAttackAfterInvalidMove();

    setTimeout(() => this.handleSmartComputerAttack(), this.computerAI.getDelayTime(true));
  }

  // Handle player attack logic
  static handlePlayerAttack(event) {
    if (
      !this.gameState ||
      this.gameState.getState() !== GAME_STATES.PLAYING ||
      this.gameState.getCurrentPlayer() !== PLAYERS.PLAYER
    ) {
      return;
    }

    const cell = event.target;
    if (
      cell.classList.contains("cell") &&
      !cell.classList.contains("attacked") &&
      !cell.classList.contains("label")
    ) {
      const x = parseInt(cell.dataset.row, 10) - 1;
      const y = parseInt(cell.dataset.col, 10) - 1;
      const hit = this.player.attack(this.computer, x, y);

      if (hit) {
        this.computerShip = this.computer.gameBoard.board[x][y];
      }

      UI.fillCell(cell, hit);

      playSound(
        hit ? (this.computerShip.isSunk() ? "killed" : "wounded") : "missed"
      );

      if (this.computer.gameBoard.areAllShipsSunk()) {
        playSound("win");
        this.gameState.setWinner(PLAYERS.PLAYER);
        UI.showGameOverModal("You won!");
        UI.updateNotification("You won!");
        UI.computerBoard.removeEventListener(
          "click",
          this.handlePlayerAttackBound
        );
      } else {
        if (!hit) {
          this.gameState.setCurrentPlayer(PLAYERS.COMPUTER);
          UI.updateNotification("Computer's turn, please wait.");
          setTimeout(() => {
            this.playerShip
              ? this.handleSmartComputerAttack()
              : this.handleComputerAttack();
          }, this.computerAI.getDelayTime());
        }
      }
    }
  }
}
