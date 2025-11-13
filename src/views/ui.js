import * as bootstrap from "bootstrap";
import { BOARD_SIZE, ORIENTATIONS } from "../constants/game-constants";

// CSS class constants
const CSS_CLASSES = {
  CELL: "cell",
  LABEL: "label",
  SHIP_CELL: "ship-cell",
  DRAGGING: "dragging",
  ATTACKED: "attacked",
  CONTENT: "content",
  VALID_DROP: "valid-drop",
  INVALID_DROP: "invalid-drop",
  PLAYER_SHIP: "player-ship",
  TEXT_DANGER: "text-danger",
  TEXT_PRIMARY: "text-primary",
};

// Selector constants
const SELECTORS = {
  START_BUTTON: ".start-button",
  NOTIFICATION: ".notification",
  COMPUTER_BOARD: ".computer .game-board",
  PLAYER_BOARD: ".player .game-board",
  RANDOMIZE_BUTTON: ".randomize",
  GAME_BOARDS: ".game-board",
  GAME_OVER_MODAL: "#game-over-modal",
  PLAY_AGAIN: ".play-again",
  SOUND_ON: "#sound-on",
  OUTCOME: ".outcome",
};

// Board column labels
const COLUMN_LABELS = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export default class UI {
  // DOM element references
  static startButton = document.querySelector(SELECTORS.START_BUTTON);
  static notification = document.querySelector(SELECTORS.NOTIFICATION);
  static computerBoard = document.querySelector(SELECTORS.COMPUTER_BOARD);
  static playerBoard = document.querySelector(SELECTORS.PLAYER_BOARD);
  static randomizeButton = document.querySelector(SELECTORS.RANDOMIZE_BUTTON);
  static boards = document.querySelectorAll(SELECTORS.GAME_BOARDS);
  static gameOverModal = document.querySelector(SELECTORS.GAME_OVER_MODAL);
  static playAgainButton =
    this.gameOverModal?.querySelector(SELECTORS.PLAY_AGAIN) || null;

  // Drag and drop state
  static dragState = {
    isDragging: false,
    ship: null,
    originalPosition: null,
    originalOrientation: null,
    player: null,
  };

  // Track if drag/drop is enabled (only during setup phase)
  static dragDropEnabled = true;
  // Track if drag/drop listeners are set up
  static dragDropListenersSetup = false;

  // ==================== Modal Methods ====================

  static showModal(modal) {
    const myModal = new bootstrap.Modal(modal);
    myModal.show();
  }

  static showGameOverModal(outcome) {
    this.gameOverModal.querySelector(SELECTORS.OUTCOME).textContent = outcome;
    this.showModal(this.gameOverModal);
  }

  static soundOn() {
    return document.querySelector(SELECTORS.SOUND_ON).checked;
  }

  // ==================== Initialization Methods ====================

  static initialize() {
    this.clearBoards();
    this.createBoards();
    this.dragDropListenersSetup = false;
  }

  static clearBoards() {
    this.boards.forEach((board) => {
      board.innerHTML = "";
    });
  }

  static createBoards() {
    this.boards.forEach((board) => {
      this.createColumnLabels(board);
      this.createRows(board);
    });
  }

  static createColumnLabels(board) {
    COLUMN_LABELS.forEach((label) => {
      const labelDiv = this.createLabelCell(label);
      board.appendChild(labelDiv);
    });
  }

  static createRows(board) {
    for (let row = 1; row <= BOARD_SIZE; row++) {
      const rowLabelDiv = this.createLabelCell(row);
      board.appendChild(rowLabelDiv);
      this.createRowCells(board, row);
    }
  }

  static createRowCells(board, row) {
    for (let col = 1; col <= BOARD_SIZE; col++) {
      const cellDiv = this.createGameCell(row, col);
      board.appendChild(cellDiv);
    }
  }

  static createLabelCell(text) {
    const labelDiv = document.createElement("div");
    labelDiv.textContent = text;
    labelDiv.classList.add(CSS_CLASSES.CELL, CSS_CLASSES.LABEL);
    return labelDiv;
  }

  static createGameCell(row, col) {
    const cellDiv = document.createElement("div");
    cellDiv.classList.add(CSS_CLASSES.CELL);
    cellDiv.dataset.row = row;
    cellDiv.dataset.col = col;
    return cellDiv;
  }

  // ==================== Board Rendering Methods ====================

  static renderBoards(players) {
    players.forEach((player) => {
      this.renderPlayerBoardState(player);
    });

    if (this.dragDropEnabled) {
      const playerObj = players.find((p) => p.name === "player");
      this.setupDragAndDrop(playerObj);
    }
  }

  static renderPlayerBoardState(player) {
    const board = document.querySelector(`.${player.name} .game-board`);
    
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        const cell = this.getCellFromCoordinates(x, y, board);
        if (player.gameBoard.board[x][y] !== null) {
          cell.classList.add(`${player.name}-ship`);
          if (player.name === "player" && this.dragDropEnabled) {
            this.makeCellDraggable(cell);
          }
        }
      }
    }
  }

  static renderPlayerBoard(player) {
    this.clearPlayerBoardCells();
    this.renderPlayerShips(player);
    
    if (this.dragDropEnabled) {
      this.dragDropListenersSetup = false;
      this.setupDragAndDrop(player);
    }
  }

  static clearPlayerBoardCells() {
    const cells = this.playerBoard.querySelectorAll(`.${CSS_CLASSES.CELL}`);
    cells.forEach((cell) => {
      cell.classList.remove(CSS_CLASSES.PLAYER_SHIP, CSS_CLASSES.SHIP_CELL, CSS_CLASSES.DRAGGING);
      cell.draggable = false;
    });
  }

  static renderPlayerShips(player) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        const cell = this.getCellFromCoordinates(x, y, this.playerBoard);
        if (player.gameBoard.board[x][y] !== null) {
          cell.classList.add(CSS_CLASSES.PLAYER_SHIP);
          if (this.dragDropEnabled) {
            this.makeCellDraggable(cell);
          }
        }
      }
    }
  }

  static makeCellDraggable(cell) {
    cell.classList.add(CSS_CLASSES.SHIP_CELL);
    cell.draggable = true;
  }

  // ==================== Game State Methods ====================

  static showComputerBoard() {
    if (this.startButton) this.startButton.style.display = "none";
    if (this.computerBoard) {
      this.computerBoard.style.opacity = 1;
      this.computerBoard.style.pointerEvents = "auto";
    }
    this.disableDragAndDrop();
  }

  static fadeComputerBoard() {
    if (this.startButton) this.startButton.style.display = "block";
    if (this.computerBoard) {
      this.computerBoard.style.opacity = 0.25;
      this.computerBoard.style.pointerEvents = "none";
    }
    this.dragDropEnabled = true;
  }

  static disableDragAndDrop() {
    this.dragDropEnabled = false;
    if (this.playerBoard) {
      const shipCells = this.playerBoard.querySelectorAll(`.${CSS_CLASSES.SHIP_CELL}`);
      shipCells.forEach((cell) => {
        cell.draggable = false;
        cell.classList.remove(CSS_CLASSES.SHIP_CELL);
      });
    }
  }

  static updateNotification(text) {
    this.notification.textContent = text;
  }

  static fillCell(cell, hit) {
    const content = document.createElement("p");
    content.classList.add(CSS_CLASSES.CONTENT);
    cell.classList.add(CSS_CLASSES.ATTACKED);

    if (hit) {
      content.textContent = "X";
      content.classList.add(CSS_CLASSES.TEXT_DANGER);
    } else {
      content.textContent = "O";
      content.classList.add(CSS_CLASSES.TEXT_PRIMARY);
    }

    cell.appendChild(content);
  }

  // ==================== Coordinate Utilities ====================

  static getCellCoordinates(cell) {
    const row = parseInt(cell.dataset.row, 10);
    const col = parseInt(cell.dataset.col, 10);
    // Convert from 1-indexed to 0-indexed
    return { x: row - 1, y: col - 1 };
  }

  static getCellFromCoordinates(x, y, board) {
    // Convert from 0-indexed to 1-indexed
    const cellSelector = `.${CSS_CLASSES.CELL}[data-row="${x + 1}"][data-col="${y + 1}"]`;
    return board.querySelector(cellSelector);
  }

  static getShipCells(ship, board, gameBoard) {
    const position = gameBoard.getShipPosition(ship);
    if (!position) return [];

    const cells = [];
    const { x, y, orientation } = position;

    for (let i = 0; i < ship.length; i++) {
      const cellCoords = this.calculateShipCellPosition(x, y, i, orientation);
      const cell = this.getCellFromCoordinates(cellCoords.x, cellCoords.y, board);
      if (cell) cells.push(cell);
    }

    return cells;
  }

  static calculateShipCellPosition(startX, startY, index, orientation) {
    return {
      x: startX + (orientation === ORIENTATIONS.VERTICAL ? index : 0),
      y: startY + (orientation === ORIENTATIONS.HORIZONTAL ? index : 0),
    };
  }

  // ==================== Visual Feedback Methods ====================

  static highlightValidPlacement(x, y, ship, orientation) {
    this.clearPlacementPreview();
    this.highlightPlacement(x, y, ship, orientation, CSS_CLASSES.VALID_DROP);
  }

  static highlightInvalidPlacement(x, y, ship, orientation) {
    this.clearPlacementPreview();
    this.highlightPlacement(x, y, ship, orientation, CSS_CLASSES.INVALID_DROP);
  }

  static highlightPlacement(x, y, ship, orientation, className) {
    for (let i = 0; i < ship.length; i++) {
      const cellCoords = this.calculateShipCellPosition(x, y, i, orientation);
      
      if (this.isValidBoardPosition(cellCoords.x, cellCoords.y)) {
        const cell = this.getCellFromCoordinates(cellCoords.x, cellCoords.y, this.playerBoard);
        if (cell && !cell.classList.contains(CSS_CLASSES.LABEL)) {
          cell.classList.add(className);
        }
      }
    }
  }

  static isValidBoardPosition(x, y) {
    return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
  }

  static clearPlacementPreview() {
    const selector = `.${CSS_CLASSES.VALID_DROP}, .${CSS_CLASSES.INVALID_DROP}`;
    const cells = this.playerBoard.querySelectorAll(selector);
    cells.forEach((cell) => {
      cell.classList.remove(CSS_CLASSES.VALID_DROP, CSS_CLASSES.INVALID_DROP);
    });
  }

  // ==================== Drag and Drop Methods ====================

  static setupDragAndDrop(player) {
    if (!player || this.dragDropListenersSetup) return;

    this.dragDropListenersSetup = true;

    this.setupDragStartHandler(player);
    this.setupDragOverHandler(player);
    this.setupDropHandler(player);
    this.setupDragEndHandler();
    this.setupDoubleClickHandler(player);
  }

  static setupDragStartHandler(player) {
    this.playerBoard.addEventListener("dragstart", (e) => {
      if (!this.dragDropEnabled) {
        e.preventDefault();
        return;
      }

      const cell = e.target;
      if (!cell.classList.contains(CSS_CLASSES.SHIP_CELL)) {
        return;
      }

      const { x, y } = this.getCellCoordinates(cell);
      const ship = player.gameBoard.board[x][y];

      if (!ship) {
        e.preventDefault();
        return;
      }

      const position = player.gameBoard.getShipPosition(ship);
      if (!position) {
        e.preventDefault();
        return;
      }

      this.initializeDragState(ship, position, player);

      // Add dragging class to ship cells
      const shipCells = this.getShipCells(
        ship,
        this.playerBoard,
        player.gameBoard
      );
      shipCells.forEach((c) => c.classList.add(CSS_CLASSES.DRAGGING));

      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", ""); // Required for Firefox
    });
  }

  static setupDragOverHandler(player) {
    this.playerBoard.addEventListener("dragover", (e) => {
      if (!this.dragDropEnabled || !this.dragState.isDragging) return;

      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      const cell = e.target.closest(`.${CSS_CLASSES.CELL}`);
      if (!cell || cell.classList.contains(CSS_CLASSES.LABEL)) {
        this.clearPlacementPreview();
        return;
      }

      const { x, y } = this.getCellCoordinates(cell);
      const { ship, originalOrientation } = this.dragState;

      // Use original orientation for preview
      const isValid = this.dragState.player.gameBoard.isValidPlacement(
        ship,
        x,
        y,
        originalOrientation,
        ship
      );

      if (isValid) {
        this.highlightValidPlacement(x, y, ship, originalOrientation);
      } else {
        this.highlightInvalidPlacement(x, y, ship, originalOrientation);
      }
    });
  }

  static setupDropHandler(player) {
    this.playerBoard.addEventListener("drop", (e) => {
      if (!this.dragDropEnabled || !this.dragState.isDragging) return;

      e.preventDefault();
      this.clearPlacementPreview();

      const cell = e.target.closest(`.${CSS_CLASSES.CELL}`);
      if (!cell || cell.classList.contains(CSS_CLASSES.LABEL)) {
        this.resetDragState();
        return;
      }

      const { x, y } = this.getCellCoordinates(cell);
      const { ship, player: playerRef, originalOrientation } = this.dragState;

      // Try to place ship at new position
      if (
        playerRef.gameBoard.isValidPlacement(
          ship,
          x,
          y,
          originalOrientation,
          ship
        )
      ) {
        // Remove ship from old position
        playerRef.gameBoard.removeShip(ship);
        // Place at new position
        playerRef.gameBoard.placeShip(ship, x, y, originalOrientation);
        // Re-render player board only
        this.renderPlayerBoard(playerRef);
      } else {
        // Invalid placement, restore original
        this.resetDragState();
      }

      this.resetDragState();
    });
  }

  static setupDragEndHandler() {
    this.playerBoard.addEventListener("dragend", () => {
      if (this.dragState.isDragging) {
        this.clearPlacementPreview();
        this.resetDragState();
      }
    });
  }

  static setupDoubleClickHandler(player) {
    this.playerBoard.addEventListener("dblclick", (e) => {
      if (!this.dragDropEnabled) return;

      const cell = e.target.closest(`.${CSS_CLASSES.CELL}`);
      if (
        !cell ||
        cell.classList.contains(CSS_CLASSES.LABEL) ||
        !cell.classList.contains(CSS_CLASSES.SHIP_CELL)
      ) {
        return;
      }

      const { x, y } = this.getCellCoordinates(cell);
      const ship = player.gameBoard.board[x][y];

      if (!ship) return;

      const success = player.gameBoard.rotateShip(ship);
      if (success) {
        // Re-render player board only
        this.renderPlayerBoard(player);
      }
    });
  }

  static initializeDragState(ship, position, player) {
    this.dragState.isDragging = true;
    this.dragState.ship = ship;
    this.dragState.originalPosition = { ...position };
    this.dragState.originalOrientation = position.orientation;
    this.dragState.player = player;
  }

  static resetDragState() {
    // Remove dragging class from all cells
    const draggingCells = this.playerBoard.querySelectorAll(`.${CSS_CLASSES.DRAGGING}`);
    draggingCells.forEach((cell) => cell.classList.remove(CSS_CLASSES.DRAGGING));

    this.dragState.isDragging = false;
    this.dragState.ship = null;
    this.dragState.originalPosition = null;
    this.dragState.originalOrientation = null;
    this.dragState.player = null;
  }
}
