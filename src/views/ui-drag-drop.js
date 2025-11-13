/**
 * UI Drag and Drop Handler
 * Manages drag and drop functionality for ship placement
 */

import { CSS_CLASSES } from "./ui-constants";
import { CoordinateUtils } from "./ui-coordinates";

export class DragDropHandler {
  constructor(playerBoard, boardManager) {
    this.playerBoard = playerBoard;
    this.boardManager = boardManager;
    this.dragState = {
      isDragging: false,
      ship: null,
      originalPosition: null,
      originalOrientation: null,
      player: null,
    };
    this.dragDropEnabled = true;
    this.dragDropListenersSetup = false;
    // Store event handler references for cleanup
    this.eventHandlers = {
      dragstart: null,
      dragover: null,
      drop: null,
      dragend: null,
      dblclick: null,
    };
    this.currentPlayer = null;
  }

  /**
   * Set drag and drop enabled state
   * @param {boolean} enabled - Whether drag and drop is enabled
   */
  setDragDropEnabled(enabled) {
    this.dragDropEnabled = enabled;
  }

  /**
   * Get drag and drop enabled state
   * @returns {boolean} - Whether drag and drop is enabled
   */
  isDragDropEnabled() {
    return this.dragDropEnabled;
  }

  /**
   * Reset listeners setup flag
   */
  resetListenersSetup() {
    this.dragDropListenersSetup = false;
  }

  /**
   * Remove all event listeners
   */
  removeEventListeners() {
    if (this.playerBoard) {
      Object.keys(this.eventHandlers).forEach((eventType) => {
        if (this.eventHandlers[eventType]) {
          this.playerBoard.removeEventListener(
            eventType,
            this.eventHandlers[eventType]
          );
          this.eventHandlers[eventType] = null;
        }
      });
    }
  }

  /**
   * Setup all drag and drop handlers
   * @param {Object} player - Player object
   * @param {boolean} forceReset - Force reset listeners even if already setup
   */
  setupDragAndDrop(player, forceReset = false) {
    if (!player || (this.dragDropListenersSetup && !forceReset)) return;

    // Remove old listeners before adding new ones
    this.removeEventListeners();

    this.dragDropListenersSetup = true;
    this.currentPlayer = player;

    this.setupDragStartHandler(player);
    this.setupDragOverHandler(player);
    this.setupDropHandler(player);
    this.setupDragEndHandler();
    this.setupDoubleClickHandler(player);
  }

  /**
   * Setup dragstart event handler
   * @param {Object} player - Player object
   */
  setupDragStartHandler(player) {
    const handler = (e) => {
      if (!this.dragDropEnabled) {
        e.preventDefault();
        return;
      }

      const cell = e.target.closest(`.${CSS_CLASSES.CELL}`);
      if (!cell || !cell.classList.contains(CSS_CLASSES.SHIP_CELL)) {
        return;
      }

      const { x, y } = CoordinateUtils.getCellCoordinates(cell);
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
      const shipCells = CoordinateUtils.getShipCells(
        ship,
        this.playerBoard,
        player.gameBoard
      );
      shipCells.forEach((c) => c.classList.add(CSS_CLASSES.DRAGGING));

      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", ""); // Required for Firefox
    };
    this.eventHandlers.dragstart = handler;
    this.playerBoard.addEventListener("dragstart", handler);
  }

  /**
   * Setup dragover event handler
   * @param {Object} player - Player object
   */
  setupDragOverHandler(player) {
    const handler = (e) => {
      if (!this.dragDropEnabled || !this.dragState.isDragging) return;

      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      const cell = e.target.closest(`.${CSS_CLASSES.CELL}`);
      if (!cell || cell.classList.contains(CSS_CLASSES.LABEL)) {
        this.boardManager.clearPlacementPreview();
        return;
      }

      const { x, y } = CoordinateUtils.getCellCoordinates(cell);
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
        this.boardManager.highlightValidPlacement(
          x,
          y,
          ship,
          originalOrientation
        );
      } else {
        this.boardManager.highlightInvalidPlacement(
          x,
          y,
          ship,
          originalOrientation
        );
      }
    };
    this.eventHandlers.dragover = handler;
    this.playerBoard.addEventListener("dragover", handler);
  }

  /**
   * Setup drop event handler
   * @param {Object} player - Player object
   */
  setupDropHandler(player) {
    const handler = (e) => {
      if (!this.dragDropEnabled || !this.dragState.isDragging) return;

      e.preventDefault();
      this.boardManager.clearPlacementPreview();

      const cell = e.target.closest(`.${CSS_CLASSES.CELL}`);
      if (!cell || cell.classList.contains(CSS_CLASSES.LABEL)) {
        this.resetDragState();
        return;
      }

      const { x, y } = CoordinateUtils.getCellCoordinates(cell);
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
        this.boardManager.renderPlayerBoard(playerRef, (p, forceReset) => {
          this.setupDragAndDrop(p, forceReset);
        });
      } else {
        // Invalid placement, restore original
        this.resetDragState();
      }

      this.resetDragState();
    };
    this.eventHandlers.drop = handler;
    this.playerBoard.addEventListener("drop", handler);
  }

  /**
   * Setup dragend event handler
   */
  setupDragEndHandler() {
    const handler = () => {
      if (this.dragState.isDragging) {
        this.boardManager.clearPlacementPreview();
        this.resetDragState();
      }
    };
    this.eventHandlers.dragend = handler;
    this.playerBoard.addEventListener("dragend", handler);
  }

  /**
   * Setup double-click event handler for rotation
   * @param {Object} player - Player object
   */
  setupDoubleClickHandler(player) {
    const handler = (e) => {
      if (!this.dragDropEnabled) return;

      const cell = e.target.closest(`.${CSS_CLASSES.CELL}`);
      if (
        !cell ||
        cell.classList.contains(CSS_CLASSES.LABEL) ||
        !cell.classList.contains(CSS_CLASSES.SHIP_CELL)
      ) {
        return;
      }

      const { x, y } = CoordinateUtils.getCellCoordinates(cell);
      const ship = player.gameBoard.board[x][y];

      if (!ship) return;

      const success = player.gameBoard.rotateShip(ship);
      if (success) {
        // Re-render player board only
        this.boardManager.renderPlayerBoard(player, (p, forceReset) => {
          this.setupDragAndDrop(p, forceReset);
        });
      }
    };
    this.eventHandlers.dblclick = handler;
    this.playerBoard.addEventListener("dblclick", handler);
  }

  /**
   * Initialize drag state
   * @param {Object} ship - Ship object
   * @param {Object} position - Ship position
   * @param {Object} player - Player object
   */
  initializeDragState(ship, position, player) {
    this.dragState.isDragging = true;
    this.dragState.ship = ship;
    this.dragState.originalPosition = { ...position };
    this.dragState.originalOrientation = position.orientation;
    this.dragState.player = player;
  }

  /**
   * Reset drag state
   */
  resetDragState() {
    // Remove dragging class from all cells
    const draggingCells = this.playerBoard.querySelectorAll(
      `.${CSS_CLASSES.DRAGGING}`
    );
    draggingCells.forEach((cell) =>
      cell.classList.remove(CSS_CLASSES.DRAGGING)
    );

    this.dragState.isDragging = false;
    this.dragState.ship = null;
    this.dragState.originalPosition = null;
    this.dragState.originalOrientation = null;
    this.dragState.player = null;
  }
}

