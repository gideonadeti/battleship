/**
 * UI Main Class
 * Coordinates all UI functionality including modals, game state, and board management
 */

import * as bootstrap from "bootstrap";
import { SELECTORS } from "./ui-constants";
import { BoardManager } from "./ui-board";
import { DragDropHandler } from "./ui-drag-drop";
import { CoordinateUtils } from "./ui-coordinates";

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

  // Initialize managers
  static boardManager = new BoardManager(this.playerBoard, this.boards);
  static dragDropHandler = new DragDropHandler(
    this.playerBoard,
    this.boardManager
  );

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

  static isMarkVerifiedEnabled() {
    return document.querySelector(SELECTORS.MARK_VERIFIED)?.checked || false;
  }

  // ==================== Initialization Methods ====================

  static initialize() {
    this.boardManager.clearBoards();
    this.boardManager.createBoards();
    this.dragDropHandler.resetListenersSetup();
  }

  // ==================== Board Rendering Methods ====================

  static renderBoards(players) {
    // Enable drag and drop when rendering boards initially
    this.enableDragAndDrop();
    // Reset listeners setup to ensure they get set up
    this.dragDropHandler.resetListenersSetup();
    const setupDragAndDrop = (player) => {
      this.dragDropHandler.setupDragAndDrop(player, true);
    };
    this.boardManager.renderBoards(players, setupDragAndDrop);
  }

  static renderPlayerBoard(player) {
    const setupDragAndDrop = (player, forceReset) => {
      this.dragDropHandler.setupDragAndDrop(player, forceReset);
    };
    this.boardManager.renderPlayerBoard(player, setupDragAndDrop);
  }

  static fillCell(cell, hit) {
    this.boardManager.fillCell(cell, hit);
  }

  static markVerifiedEmptyCell(x, y, boardElement) {
    this.boardManager.markVerifiedEmptyCell(x, y, boardElement);
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
    this.enableDragAndDrop();
  }

  static disableDragAndDrop() {
    this.dragDropHandler.setDragDropEnabled(false);
    this.boardManager.setDragDropEnabled(false);
    this.boardManager.disableDragAndDrop();
  }

  static enableDragAndDrop() {
    this.dragDropHandler.setDragDropEnabled(true);
    this.boardManager.setDragDropEnabled(true);
  }

  static updateNotification(text) {
    this.notification.textContent = text;
  }

  // ==================== Drag and Drop State (for external access) ====================

  static get dragDropEnabled() {
    return this.dragDropHandler.isDragDropEnabled();
  }

  static set dragDropEnabled(value) {
    this.dragDropHandler.setDragDropEnabled(value);
    this.boardManager.setDragDropEnabled(value);
  }

  static get dragDropListenersSetup() {
    return this.dragDropHandler.dragDropListenersSetup;
  }

  static set dragDropListenersSetup(value) {
    if (!value) {
      this.dragDropHandler.resetListenersSetup();
    }
    // Setting to true is handled by setupDragAndDrop
  }

  static get dragState() {
    return this.dragDropHandler.dragState;
  }

  // ==================== Coordinate Utilities (delegated methods) ====================

  static getCellCoordinates(cell) {
    return CoordinateUtils.getCellCoordinates(cell);
  }

  static getCellFromCoordinates(x, y, board) {
    return CoordinateUtils.getCellFromCoordinates(x, y, board);
  }

  static getShipCells(ship, board, gameBoard) {
    return CoordinateUtils.getShipCells(ship, board, gameBoard);
  }

  static calculateShipCellPosition(startX, startY, index, orientation) {
    return CoordinateUtils.calculateShipCellPosition(
      startX,
      startY,
      index,
      orientation
    );
  }

  // ==================== Visual Feedback Methods (delegated methods) ====================

  static highlightValidPlacement(x, y, ship, orientation) {
    this.boardManager.highlightValidPlacement(x, y, ship, orientation);
  }

  static highlightInvalidPlacement(x, y, ship, orientation) {
    this.boardManager.highlightInvalidPlacement(x, y, ship, orientation);
  }

  static clearPlacementPreview() {
    this.boardManager.clearPlacementPreview();
  }

  static isValidBoardPosition(x, y) {
    return CoordinateUtils.isValidBoardPosition(x, y);
  }

  // ==================== Drag and Drop Methods (delegated methods) ====================

  static setupDragAndDrop(player) {
    this.dragDropHandler.setupDragAndDrop(player);
  }

  static resetDragState() {
    this.dragDropHandler.resetDragState();
  }
}
