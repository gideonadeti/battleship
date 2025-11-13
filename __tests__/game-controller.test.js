import GameController from "../src/game/game-controller";
import GameState from "../src/game/game-state";
import ComputerAI from "../src/ai/computer-ai";
import Player from "../src/models/player";
import Ship from "../src/models/ship";
import GameBoard from "../src/models/game-board";
import {
  GAME_STATES,
  PLAYERS,
  BOARD_SIZE,
} from "../src/constants/game-constants";
import { ORIENTATIONS } from "../src/constants/game-constants";
import { createCellElement, createMockElement } from "./helpers/dom-helpers";

// Mock dependencies
jest.mock("../src/models/sounds", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../src/views/ui", () => ({
  __esModule: true,
  default: {
    computerBoard: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    updateNotification: jest.fn(),
    fillCell: jest.fn(),
    showGameOverModal: jest.fn(),
  },
}));

import playSound from "../src/models/sounds";
import UI from "../src/views/ui";

describe("GameController", () => {
  let player;
  let computer;
  let gameController;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Create players with empty boards for testing
    player = new Player(PLAYERS.PLAYER);
    computer = new Player(PLAYERS.COMPUTER);

    // Mock document.querySelector for DOM operations
    const mockCell = createCellElement(1, 1);
    document.querySelector = jest.fn(() => mockCell);

    gameController = new GameController(player, computer);
  });

  afterEach(() => {
    jest.useRealTimers();
    if (gameController) {
      gameController.cleanup();
    }
  });

  describe("constructor", () => {
    test("should initialize with player and computer", () => {
      expect(gameController.player).toBe(player);
      expect(gameController.computer).toBe(computer);
      expect(gameController.gameState).toBeInstanceOf(GameState);
      expect(gameController.computerAI).toBeInstanceOf(ComputerAI);
      expect(gameController.computerTimeout).toBeNull();
      expect(gameController.computerShip).toBeNull();
      expect(gameController.playerShip).toBeNull();
    });

    test("should bind handlePlayerAttack method", () => {
      expect(gameController.handlePlayerAttackBound).toBeDefined();
    });
  });

  describe("initialize", () => {
    test("should set game state to PLAYING", () => {
      gameController.initialize();
      expect(gameController.gameState.isState(GAME_STATES.PLAYING)).toBe(true);
    });

    test("should set a starting player", () => {
      gameController.initialize();
      const currentPlayer = gameController.gameState.getCurrentPlayer();
      expect([PLAYERS.PLAYER, PLAYERS.COMPUTER]).toContain(currentPlayer);
    });

    test("should add event listener to computer board", () => {
      gameController.initialize();
      expect(UI.computerBoard.addEventListener).toHaveBeenCalledWith(
        "click",
        gameController.handlePlayerAttackBound
      );
    });

    test("should play game started sound", () => {
      gameController.initialize();
      expect(playSound).toHaveBeenCalledWith("gameStarted");
    });

    test("should update notification with player turn when player starts", () => {
      // Mock Math.random to ensure player starts
      jest.spyOn(Math, "random").mockReturnValue(0.6);
      gameController.initialize();
      expect(UI.updateNotification).toHaveBeenCalledWith(
        "The game started, your turn."
      );
      Math.random.mockRestore();
    });

    test("should update notification with computer turn when computer starts", () => {
      // Mock Math.random to ensure computer starts
      jest.spyOn(Math, "random").mockReturnValue(0.4);
      gameController.initialize();
      expect(UI.updateNotification).toHaveBeenCalledWith(
        "The game started, computer's turn."
      );
      Math.random.mockRestore();
    });

    test("should schedule computer attack if computer starts", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.4);
      jest.spyOn(gameController, "scheduleComputerAttack");
      gameController.initialize();
      expect(gameController.scheduleComputerAttack).toHaveBeenCalled();
      Math.random.mockRestore();
    });
  });

  describe("handlePlayerAttack", () => {
    beforeEach(() => {
      gameController.initialize();
      gameController.gameState.setCurrentPlayer(PLAYERS.PLAYER);
      gameController.gameState.setState(GAME_STATES.PLAYING);
    });

    test("should not attack if game is not in PLAYING state", () => {
      gameController.gameState.setState(GAME_STATES.GAME_OVER);
      const mockEvent = {
        target: {
          classList: { contains: jest.fn(() => true) },
          dataset: { row: "1", col: "1" },
        },
      };
      jest.spyOn(player, "attack");

      gameController.handlePlayerAttack(mockEvent);

      expect(player.attack).not.toHaveBeenCalled();
    });

    test("should not attack if not player turn", () => {
      gameController.gameState.setCurrentPlayer(PLAYERS.COMPUTER);
      const mockEvent = {
        target: {
          classList: { contains: jest.fn(() => true) },
          dataset: { row: "1", col: "1" },
        },
      };
      jest.spyOn(player, "attack");

      gameController.handlePlayerAttack(mockEvent);

      expect(player.attack).not.toHaveBeenCalled();
    });

    test("should not attack if cell is already attacked", () => {
      const mockCell = createCellElement(1, 1, ["attacked"]);
      const mockEvent = { target: mockCell };
      jest.spyOn(player, "attack");

      gameController.handlePlayerAttack(mockEvent);

      expect(player.attack).not.toHaveBeenCalled();
    });

    test("should not attack if target is label", () => {
      const mockCell = createCellElement(1, 1, ["label"]);
      const mockEvent = { target: mockCell };
      jest.spyOn(player, "attack");

      gameController.handlePlayerAttack(mockEvent);

      expect(player.attack).not.toHaveBeenCalled();
    });

    test("should attack valid cell and fill it", () => {
      const ship = new Ship(2);
      computer.gameBoard.placeShip(ship, 0, 0, ORIENTATIONS.HORIZONTAL);

      const mockCell = createCellElement(1, 1);
      const mockEvent = { target: mockCell };
      jest.spyOn(player, "attack");

      gameController.handlePlayerAttack(mockEvent);

      expect(player.attack).toHaveBeenCalledWith(computer, 0, 0);
      expect(UI.fillCell).toHaveBeenCalledWith(mockCell, true);
    });

    test("should play wounded sound on hit", () => {
      const ship = new Ship(2);
      computer.gameBoard.placeShip(ship, 0, 0, ORIENTATIONS.HORIZONTAL);

      const mockCell = createCellElement(1, 1);
      const mockEvent = { target: mockCell };
      // Don't mock - let it actually hit (ship has length 2, so first hit won't sink it)

      gameController.handlePlayerAttack(mockEvent);

      expect(playSound).toHaveBeenCalledWith("wounded");
    });

    test("should play killed sound when ship is sunk", () => {
      const ship = new Ship(1);
      computer.gameBoard.placeShip(ship, 0, 0, ORIENTATIONS.HORIZONTAL);

      const mockCell = createCellElement(1, 1);
      const mockEvent = { target: mockCell };
      // Don't mock player.attack - let it actually hit the ship
      // For a length 1 ship, one hit will sink it

      gameController.handlePlayerAttack(mockEvent);

      expect(playSound).toHaveBeenCalledWith("killed");
    });

    test("should play missed sound on miss", () => {
      // Place a ship that won't be sunk, so areAllShipsSunk() returns false
      // This ensures the code doesn't return early from the areAllShipsSunk() check
      const ship = new Ship(2);
      computer.gameBoard.placeShip(ship, 5, 5, ORIENTATIONS.HORIZONTAL);

      // Ensure computer board is empty at (0, 0) - no ship placed there
      expect(computer.gameBoard.board[0][0]).toBeNull();

      const mockCell = createCellElement(1, 1);
      const mockEvent = { target: mockCell };
      jest.spyOn(gameController, "scheduleComputerAttack");
      jest.spyOn(player, "attack").mockReturnValue(false); // Explicitly mock to return false (miss)
      jest.spyOn(gameController, "endGame"); // Spy on endGame to ensure it's not called

      // Ensure it's player's turn
      gameController.gameState.setCurrentPlayer(PLAYERS.PLAYER);
      gameController.gameState.setState(GAME_STATES.PLAYING);

      gameController.handlePlayerAttack(mockEvent);

      expect(player.attack).toHaveBeenCalledWith(computer, 0, 0);
      expect(playSound).toHaveBeenCalledWith("missed");
      expect(gameController.endGame).not.toHaveBeenCalled(); // Should not end game on miss
      expect(gameController.gameState.getCurrentPlayer()).toBe(
        PLAYERS.COMPUTER
      );
      expect(UI.updateNotification).toHaveBeenCalledWith(
        "Computer's turn, please wait."
      );
      expect(gameController.scheduleComputerAttack).toHaveBeenCalled();
    });

    test("should end game if all computer ships are sunk", () => {
      // Place a ship - when we hit it, it will sink and end the game
      const ship = new Ship(1);
      computer.gameBoard.placeShip(ship, 0, 0, ORIENTATIONS.HORIZONTAL);

      const mockCell = createCellElement(1, 1);
      const mockEvent = { target: mockCell };
      jest.spyOn(gameController, "endGame");
      // Don't mock player.attack - let it actually hit and sink the ship

      gameController.handlePlayerAttack(mockEvent);

      expect(gameController.endGame).toHaveBeenCalledWith(PLAYERS.PLAYER);
    });

    test("should continue player turn on hit", () => {
      const ship = new Ship(2);
      computer.gameBoard.placeShip(ship, 0, 0, ORIENTATIONS.HORIZONTAL);

      const mockCell = createCellElement(1, 1);
      const mockEvent = { target: mockCell };
      // Don't mock - let it actually hit (ship won't be sunk on first hit)

      gameController.handlePlayerAttack(mockEvent);

      expect(gameController.gameState.getCurrentPlayer()).toBe(PLAYERS.PLAYER);
    });
  });

  describe("scheduleComputerAttack", () => {
    beforeEach(() => {
      gameController.initialize();
      gameController.gameState.setCurrentPlayer(PLAYERS.COMPUTER);
      gameController.gameState.setState(GAME_STATES.PLAYING);
    });

    test("should clear existing timeout", () => {
      // Set up a timeout
      gameController.computerTimeout = setTimeout(() => {}, 1000);
      const initialTimerCount = jest.getTimerCount();

      // scheduleComputerAttack should clear the existing timeout and set a new one
      gameController.scheduleComputerAttack();

      // Verify a new timeout was scheduled
      expect(gameController.computerTimeout).not.toBeNull();
      // With fake timers, we can verify timers were managed
      expect(jest.getTimerCount()).toBeGreaterThan(0);
    });

    test("should schedule computer attack with delay", () => {
      jest.spyOn(gameController, "executeComputerAttack");
      gameController.scheduleComputerAttack();

      expect(gameController.computerTimeout).not.toBeNull();
      // Advance timers by enough time to trigger the attack
      jest.advanceTimersByTime(2000);

      expect(gameController.executeComputerAttack).toHaveBeenCalled();
    });

    test("should schedule smart attack if target ship exists", () => {
      const ship = new Ship(2);
      gameController.computerAI.prepareSmartAttack(0, 0, ship);
      jest.spyOn(gameController, "executeSmartComputerAttack");

      gameController.scheduleComputerAttack();
      jest.advanceTimersByTime(2000);

      expect(gameController.executeSmartComputerAttack).toHaveBeenCalled();
    });
  });

  describe("executeComputerAttack", () => {
    beforeEach(() => {
      gameController.initialize();
      gameController.gameState.setCurrentPlayer(PLAYERS.COMPUTER);
      gameController.gameState.setState(GAME_STATES.PLAYING);

      // Mock document.querySelector to return a valid cell
      const mockCell = document.createElement("div");
      mockCell.classList.add("cell");
      mockCell.dataset.row = "1";
      mockCell.dataset.col = "1";
      document.querySelector = jest.fn(() => mockCell);
    });

    test("should not attack if game is not in PLAYING state", () => {
      gameController.gameState.setState(GAME_STATES.GAME_OVER);
      jest.spyOn(computer, "attack");

      gameController.executeComputerAttack();

      expect(computer.attack).not.toHaveBeenCalled();
    });

    test("should not attack if not computer turn", () => {
      gameController.gameState.setCurrentPlayer(PLAYERS.PLAYER);
      jest.spyOn(computer, "attack");

      gameController.executeComputerAttack();

      expect(computer.attack).not.toHaveBeenCalled();
    });

    test("should find and attack a random cell", () => {
      // Mock document.querySelector to return a valid cell for any coordinates
      const mockCell = createCellElement(1, 1);
      document.querySelector = jest.fn(() => mockCell);

      jest.spyOn(computer, "attack").mockReturnValue(false);

      gameController.executeComputerAttack();

      expect(computer.attack).toHaveBeenCalled();
      expect(UI.fillCell).toHaveBeenCalledWith(mockCell, false);
    });

    test("should fill cell after attack", () => {
      const mockCell = createCellElement(1, 1);
      document.querySelector = jest.fn(() => mockCell);
      jest.spyOn(computer, "attack").mockReturnValue(false);

      gameController.executeComputerAttack();

      expect(UI.fillCell).toHaveBeenCalledWith(mockCell, false);
    });

    test("should play sound on attack", () => {
      const mockCell = createCellElement(1, 1);
      document.querySelector = jest.fn(() => mockCell);
      jest.spyOn(computer, "attack").mockReturnValue(false);

      gameController.executeComputerAttack();

      expect(playSound).toHaveBeenCalledWith("missed");
    });

    test("should prepare smart attack on hit", () => {
      const ship = new Ship(2);
      player.gameBoard.placeShip(ship, 0, 0, ORIENTATIONS.HORIZONTAL);

      // Mock document.querySelector to return cell for coordinates 0,0
      const mockCell = createCellElement(1, 1);
      // Make querySelector return the cell for the specific coordinates
      document.querySelector = jest.fn((selector) => {
        if (
          selector.includes('data-row="1"') &&
          selector.includes('data-col="1"')
        ) {
          return mockCell;
        }
        return null;
      });

      // Mock Math.random and Math.floor to generate coordinates 0,0
      const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.05);
      const floorSpy = jest.spyOn(Math, "floor").mockReturnValue(0);
      jest.spyOn(computer, "attack").mockReturnValue(true);
      jest.spyOn(gameController.computerAI, "prepareSmartAttack");
      jest.spyOn(gameController, "scheduleComputerAttack");

      gameController.executeComputerAttack();

      expect(gameController.computerAI.prepareSmartAttack).toHaveBeenCalled();
      expect(gameController.scheduleComputerAttack).toHaveBeenCalled();
      randomSpy.mockRestore();
      floorSpy.mockRestore();
    });

    test("should switch to player turn on miss", () => {
      const mockCell = createCellElement(1, 1);
      document.querySelector = jest.fn(() => mockCell);
      jest.spyOn(computer, "attack").mockReturnValue(false);

      gameController.executeComputerAttack();

      expect(gameController.gameState.getCurrentPlayer()).toBe(PLAYERS.PLAYER);
      expect(UI.updateNotification).toHaveBeenCalledWith("Your turn.");
    });

    test("should handle already attacked cells by finding another", () => {
      // Create a cell that's already attacked
      const attackedCell = createCellElement(1, 1, ["attacked"]);

      // Create a valid cell
      const validCell = createCellElement(2, 2);

      // Mock querySelector to return attacked cell first, then valid cell
      let callCount = 0;
      document.querySelector = jest.fn(() => {
        callCount++;
        if (callCount <= 10) {
          return attackedCell; // Return attacked cell first
        }
        return validCell; // Then return valid cell
      });

      jest.spyOn(computer, "attack").mockReturnValue(false);

      gameController.executeComputerAttack();

      // Should eventually find and attack the valid cell
      expect(computer.attack).toHaveBeenCalled();
      expect(UI.fillCell).toHaveBeenCalledWith(validCell, false);
    });
  });

  describe("executeSmartComputerAttack", () => {
    beforeEach(() => {
      gameController.initialize();
      gameController.gameState.setCurrentPlayer(PLAYERS.COMPUTER);
      gameController.gameState.setState(GAME_STATES.PLAYING);

      const ship = new Ship(2);
      gameController.computerAI.prepareSmartAttack(0, 0, ship);
    });

    test("should not attack if game is not in PLAYING state", () => {
      gameController.gameState.setState(GAME_STATES.GAME_OVER);
      jest.spyOn(computer, "attack");

      gameController.executeSmartComputerAttack();

      expect(computer.attack).not.toHaveBeenCalled();
    });

    test("should not attack if not computer turn", () => {
      gameController.gameState.setCurrentPlayer(PLAYERS.PLAYER);
      jest.spyOn(computer, "attack");

      gameController.executeSmartComputerAttack();

      expect(computer.attack).not.toHaveBeenCalled();
    });

    test("should reset if target ship is sunk", () => {
      const ship = gameController.computerAI.targetShip;
      ship.hit();
      ship.hit(); // Sink the ship
      jest.spyOn(gameController.computerAI, "resetSmartAttack");
      jest.spyOn(gameController, "scheduleComputerAttack");

      gameController.executeSmartComputerAttack();

      expect(gameController.computerAI.resetSmartAttack).toHaveBeenCalled();
      expect(gameController.scheduleComputerAttack).toHaveBeenCalled();
    });

    test("should attack adjacent cell", () => {
      const mockCell = createCellElement(1, 1);
      document.querySelector = jest.fn(() => mockCell);
      jest.spyOn(computer, "attack").mockReturnValue(true);
      jest.spyOn(gameController, "processSmartAttack");

      gameController.executeSmartComputerAttack();

      expect(gameController.processSmartAttack).toHaveBeenCalled();
    });

    test("should handle invalid move", () => {
      document.querySelector = jest.fn(() => null);
      jest.spyOn(gameController, "updateSmartAttackAfterInvalidMove");

      gameController.executeSmartComputerAttack();

      expect(
        gameController.updateSmartAttackAfterInvalidMove
      ).toHaveBeenCalled();
    });
  });

  describe("processSmartAttack", () => {
    beforeEach(() => {
      gameController.initialize();
      gameController.gameState.setCurrentPlayer(PLAYERS.COMPUTER);
      gameController.gameState.setState(GAME_STATES.PLAYING);

      const ship = new Ship(2);
      gameController.computerAI.prepareSmartAttack(0, 0, ship);
    });

    test("should attack and fill cell", () => {
      const mockCell = createCellElement(1, 1);
      jest.spyOn(computer, "attack").mockReturnValue(true);

      gameController.processSmartAttack(0, 1, mockCell);

      expect(computer.attack).toHaveBeenCalledWith(player, 0, 1);
      expect(UI.fillCell).toHaveBeenCalledWith(mockCell, true);
    });

    test("should play sound on attack", () => {
      const mockCell = createCellElement(1, 1);
      jest.spyOn(computer, "attack").mockReturnValue(true);

      gameController.processSmartAttack(0, 1, mockCell);

      expect(playSound).toHaveBeenCalled();
    });

    test("should end game if all player ships are sunk", () => {
      // Place and sink all ships
      const ship = new Ship(1);
      player.gameBoard.placeShip(ship, 0, 1, ORIENTATIONS.HORIZONTAL);
      ship.hit();

      const mockCell = createCellElement(1, 1);
      jest.spyOn(computer, "attack").mockReturnValue(true);
      jest.spyOn(gameController, "endGame");

      gameController.processSmartAttack(0, 1, mockCell);

      expect(gameController.endGame).toHaveBeenCalledWith(PLAYERS.COMPUTER);
    });

    test("should update smart attack on hit", () => {
      // Place a ship that won't be sunk, so areAllShipsSunk() returns false
      const ship = new Ship(2);
      player.gameBoard.placeShip(ship, 5, 5, ORIENTATIONS.HORIZONTAL);

      const mockCell = createCellElement(1, 1);
      jest.spyOn(computer, "attack").mockReturnValue(true);
      jest.spyOn(gameController, "updateSmartAttackOnHit");
      jest.spyOn(gameController, "scheduleComputerAttack");
      jest.spyOn(gameController, "endGame");

      gameController.processSmartAttack(0, 1, mockCell);

      expect(gameController.endGame).not.toHaveBeenCalled(); // Should not end game
      expect(gameController.updateSmartAttackOnHit).toHaveBeenCalledWith(0, 1);
      expect(gameController.scheduleComputerAttack).toHaveBeenCalled();
    });

    test("should update smart attack on miss", () => {
      // Place a ship that won't be sunk, so areAllShipsSunk() returns false
      const ship = new Ship(2);
      player.gameBoard.placeShip(ship, 5, 5, ORIENTATIONS.HORIZONTAL);

      const mockCell = createCellElement(1, 1);
      jest.spyOn(computer, "attack").mockReturnValue(false);
      jest.spyOn(gameController, "updateSmartAttackOnMiss");
      jest.spyOn(gameController, "endGame");

      gameController.processSmartAttack(0, 1, mockCell);

      expect(gameController.endGame).not.toHaveBeenCalled(); // Should not end game
      expect(gameController.updateSmartAttackOnMiss).toHaveBeenCalled();
    });
  });

  describe("updateSmartAttackOnHit", () => {
    test("should update computerAI and schedule next attack", () => {
      const ship = new Ship(2);
      gameController.computerAI.prepareSmartAttack(0, 0, ship);
      jest.spyOn(gameController.computerAI, "updateSmartAttackOnHit");
      jest.spyOn(gameController, "scheduleComputerAttack");

      gameController.updateSmartAttackOnHit(0, 1);

      expect(
        gameController.computerAI.updateSmartAttackOnHit
      ).toHaveBeenCalledWith(0, 1);
      expect(gameController.scheduleComputerAttack).toHaveBeenCalled();
    });
  });

  describe("updateSmartAttackOnMiss", () => {
    test("should update computerAI and switch to player turn", () => {
      const ship = new Ship(2);
      gameController.computerAI.prepareSmartAttack(0, 0, ship);
      jest.spyOn(gameController.computerAI, "updateSmartAttackOnMiss");

      gameController.updateSmartAttackOnMiss();

      expect(
        gameController.computerAI.updateSmartAttackOnMiss
      ).toHaveBeenCalled();
      expect(gameController.gameState.getCurrentPlayer()).toBe(PLAYERS.PLAYER);
      expect(UI.updateNotification).toHaveBeenCalledWith("Your turn.");
    });
  });

  describe("updateSmartAttackAfterInvalidMove", () => {
    test("should update computerAI and schedule next attack", () => {
      const ship = new Ship(2);
      gameController.computerAI.prepareSmartAttack(0, 0, ship);
      jest.spyOn(
        gameController.computerAI,
        "updateSmartAttackAfterInvalidMove"
      );
      jest.spyOn(gameController, "scheduleComputerAttack");

      gameController.updateSmartAttackAfterInvalidMove();

      expect(
        gameController.computerAI.updateSmartAttackAfterInvalidMove
      ).toHaveBeenCalled();
      expect(gameController.scheduleComputerAttack).toHaveBeenCalled();
    });
  });

  describe("endGame", () => {
    beforeEach(() => {
      gameController.initialize();
      gameController.computerTimeout = setTimeout(() => {}, 1000);
    });

    test("should set winner and game over state", () => {
      gameController.endGame(PLAYERS.PLAYER);

      expect(gameController.gameState.getWinner()).toBe(PLAYERS.PLAYER);
      expect(gameController.gameState.isState(GAME_STATES.GAME_OVER)).toBe(
        true
      );
    });

    test("should clear computer timeout", () => {
      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
      gameController.endGame(PLAYERS.PLAYER);

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    test("should remove event listener", () => {
      gameController.endGame(PLAYERS.PLAYER);

      expect(UI.computerBoard.removeEventListener).toHaveBeenCalledWith(
        "click",
        gameController.handlePlayerAttackBound
      );
    });

    test("should play win sound when player wins", () => {
      gameController.endGame(PLAYERS.PLAYER);

      expect(playSound).toHaveBeenCalledWith("win");
    });

    test("should play lose sound when computer wins", () => {
      gameController.endGame(PLAYERS.COMPUTER);

      expect(playSound).toHaveBeenCalledWith("lose");
    });

    test("should show game over modal with correct outcome", () => {
      gameController.endGame(PLAYERS.PLAYER);

      expect(UI.showGameOverModal).toHaveBeenCalledWith("You won!");
      expect(UI.updateNotification).toHaveBeenCalledWith("You won!");
    });

    test("should show lose message when computer wins", () => {
      gameController.endGame(PLAYERS.COMPUTER);

      expect(UI.showGameOverModal).toHaveBeenCalledWith("You lose!");
      expect(UI.updateNotification).toHaveBeenCalledWith("You lose!");
    });
  });

  describe("reset", () => {
    beforeEach(() => {
      gameController.initialize();
      gameController.computerTimeout = setTimeout(() => {}, 1000);
    });

    test("should clear computer timeout", () => {
      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
      gameController.reset();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    test("should remove event listener", () => {
      gameController.reset();

      expect(UI.computerBoard.removeEventListener).toHaveBeenCalledWith(
        "click",
        gameController.handlePlayerAttackBound
      );
    });

    test("should reset game state", () => {
      gameController.gameState.setState(GAME_STATES.PLAYING);
      gameController.gameState.setCurrentPlayer(PLAYERS.PLAYER);
      jest.spyOn(gameController.gameState, "reset");

      gameController.reset();

      expect(gameController.gameState.reset).toHaveBeenCalled();
    });

    test("should reset computerAI", () => {
      const ship = new Ship(2);
      gameController.computerAI.prepareSmartAttack(0, 0, ship);
      jest.spyOn(gameController.computerAI, "reset");

      gameController.reset();

      expect(gameController.computerAI.reset).toHaveBeenCalled();
    });

    test("should reset ship references", () => {
      const ship = new Ship(2);
      gameController.computerShip = ship;
      gameController.playerShip = ship;

      gameController.reset();

      expect(gameController.computerShip).toBeNull();
      expect(gameController.playerShip).toBeNull();
    });
  });

  describe("cleanup", () => {
    test("should call reset", () => {
      jest.spyOn(gameController, "reset");
      gameController.cleanup();

      expect(gameController.reset).toHaveBeenCalled();
    });
  });
});
