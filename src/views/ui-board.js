/**
 * UI Board Manager
 * Handles board creation, rendering, and visual feedback
 */

import { BOARD_SIZE } from "../constants/game-constants";
import { CSS_CLASSES, SELECTORS, COLUMN_LABELS } from "./ui-constants";
import { CoordinateUtils } from "./ui-coordinates";

export class BoardManager {
  constructor(playerBoard, boards) {
    this.playerBoard = playerBoard;
    this.boards = boards;
    this.dragDropEnabled = false;
  }

  /**
   * Set drag and drop enabled state
   * @param {boolean} enabled - Whether drag and drop is enabled
   */
  setDragDropEnabled(enabled) {
    this.dragDropEnabled = enabled;
  }

  /**
   * Clear all boards
   */
  clearBoards() {
    this.boards.forEach((board) => {
      board.innerHTML = "";
    });
  }

  /**
   * Create all game boards
   */
  createBoards() {
    this.boards.forEach((board) => {
      this.createColumnLabels(board);
      this.createRows(board);
    });
  }

  /**
   * Create column labels for a board
   * @param {HTMLElement} board - The board DOM element
   */
  createColumnLabels(board) {
    COLUMN_LABELS.forEach((label) => {
      const labelDiv = this.createLabelCell(label);
      board.appendChild(labelDiv);
    });
  }

  /**
   * Create rows for a board
   * @param {HTMLElement} board - The board DOM element
   */
  createRows(board) {
    for (let row = 1; row <= BOARD_SIZE; row++) {
      const rowLabelDiv = this.createLabelCell(row);
      board.appendChild(rowLabelDiv);
      this.createRowCells(board, row);
    }
  }

  /**
   * Create cells for a row
   * @param {HTMLElement} board - The board DOM element
   * @param {number} row - Row number (1-indexed)
   */
  createRowCells(board, row) {
    for (let col = 1; col <= BOARD_SIZE; col++) {
      const cellDiv = this.createGameCell(row, col);
      board.appendChild(cellDiv);
    }
  }

  /**
   * Create a label cell
   * @param {string|number} text - Label text
   * @returns {HTMLElement} - The label cell element
   */
  createLabelCell(text) {
    const labelDiv = document.createElement("div");
    labelDiv.textContent = text;
    labelDiv.classList.add(CSS_CLASSES.CELL, CSS_CLASSES.LABEL);
    return labelDiv;
  }

  /**
   * Create a game cell
   * @param {number} row - Row number (1-indexed)
   * @param {number} col - Column number (1-indexed)
   * @returns {HTMLElement} - The game cell element
   */
  createGameCell(row, col) {
    const cellDiv = document.createElement("div");
    cellDiv.classList.add(CSS_CLASSES.CELL);
    cellDiv.dataset.row = row;
    cellDiv.dataset.col = col;
    return cellDiv;
  }

  /**
   * Render boards for all players
   * @param {Array} players - Array of player objects
   * @param {Function} setupDragAndDrop - Callback to setup drag and drop
   */
  renderBoards(players, setupDragAndDrop) {
    players.forEach((player) => {
      this.renderPlayerBoardState(player);
    });

    if (this.dragDropEnabled && setupDragAndDrop) {
      const playerObj = players.find((p) => p.name === "player");
      setupDragAndDrop(playerObj);
    }
  }

  /**
   * Render a player's board state
   * @param {Object} player - Player object
   */
  renderPlayerBoardState(player) {
    const board = document.querySelector(`.${player.name} .game-board`);

    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        const cell = CoordinateUtils.getCellFromCoordinates(x, y, board);
        if (player.gameBoard.board[x][y] !== null) {
          cell.classList.add(`${player.name}-ship`);
          if (player.name === "player" && this.dragDropEnabled) {
            this.makeCellDraggable(cell);
          }
        }
      }
    }
  }

  /**
   * Render player board (for drag/drop updates)
   * @param {Object} player - Player object
   * @param {Function} setupDragAndDrop - Callback to setup drag and drop
   */
  renderPlayerBoard(player, setupDragAndDrop) {
    this.clearPlayerBoardCells();
    this.renderPlayerShips(player);

    if (this.dragDropEnabled && setupDragAndDrop) {
      setupDragAndDrop(player, true);
    }
  }

  /**
   * Clear all player board cells
   */
  clearPlayerBoardCells() {
    const cells = this.playerBoard.querySelectorAll(`.${CSS_CLASSES.CELL}`);
    cells.forEach((cell) => {
      cell.classList.remove(
        CSS_CLASSES.PLAYER_SHIP,
        CSS_CLASSES.SHIP_CELL,
        CSS_CLASSES.DRAGGING
      );
      cell.draggable = false;
    });
  }

  /**
   * Render player ships on the board
   * @param {Object} player - Player object
   */
  renderPlayerShips(player) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        const cell = CoordinateUtils.getCellFromCoordinates(
          x,
          y,
          this.playerBoard
        );
        if (player.gameBoard.board[x][y] !== null) {
          cell.classList.add(CSS_CLASSES.PLAYER_SHIP);
          if (this.dragDropEnabled) {
            this.makeCellDraggable(cell);
          }
        }
      }
    }
  }

  /**
   * Make a cell draggable
   * @param {HTMLElement} cell - The cell DOM element
   */
  makeCellDraggable(cell) {
    cell.classList.add(CSS_CLASSES.SHIP_CELL);
    cell.draggable = true;
  }

  /**
   * Fill a cell with hit/miss indicator
   * @param {HTMLElement} cell - The cell DOM element
   * @param {boolean} hit - Whether the attack was a hit
   */
  fillCell(cell, hit) {
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

  /**
   * Highlight valid placement preview
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {Object} ship - Ship object
   * @param {string} orientation - Ship orientation
   */
  highlightValidPlacement(x, y, ship, orientation) {
    this.clearPlacementPreview();
    this.highlightPlacement(x, y, ship, orientation, CSS_CLASSES.VALID_DROP);
  }

  /**
   * Highlight invalid placement preview
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {Object} ship - Ship object
   * @param {string} orientation - Ship orientation
   */
  highlightInvalidPlacement(x, y, ship, orientation) {
    this.clearPlacementPreview();
    this.highlightPlacement(x, y, ship, orientation, CSS_CLASSES.INVALID_DROP);
  }

  /**
   * Highlight placement preview with given class
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {Object} ship - Ship object
   * @param {string} orientation - Ship orientation
   * @param {string} className - CSS class to apply
   */
  highlightPlacement(x, y, ship, orientation, className) {
    for (let i = 0; i < ship.length; i++) {
      const cellCoords = CoordinateUtils.calculateShipCellPosition(
        x,
        y,
        i,
        orientation
      );

      if (CoordinateUtils.isValidBoardPosition(cellCoords.x, cellCoords.y)) {
        const cell = CoordinateUtils.getCellFromCoordinates(
          cellCoords.x,
          cellCoords.y,
          this.playerBoard
        );
        if (cell && !cell.classList.contains(CSS_CLASSES.LABEL)) {
          cell.classList.add(className);
        }
      }
    }
  }

  /**
   * Clear placement preview highlights
   */
  clearPlacementPreview() {
    const selector = `.${CSS_CLASSES.VALID_DROP}, .${CSS_CLASSES.INVALID_DROP}`;
    const cells = this.playerBoard.querySelectorAll(selector);
    cells.forEach((cell) => {
      cell.classList.remove(CSS_CLASSES.VALID_DROP, CSS_CLASSES.INVALID_DROP);
    });
  }

  /**
   * Disable drag and drop on player board
   */
  disableDragAndDrop() {
    if (this.playerBoard) {
      const shipCells = this.playerBoard.querySelectorAll(
        `.${CSS_CLASSES.SHIP_CELL}`
      );
      shipCells.forEach((cell) => {
        cell.draggable = false;
        cell.classList.remove(CSS_CLASSES.SHIP_CELL);
      });
    }
  }
}

