/**
 * UI Constants
 * Contains all CSS class names, DOM selectors, and other UI constants
 */

export const CSS_CLASSES = {
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
  VERIFIED_EMPTY: "verified-empty",
};

export const SELECTORS = {
  START_BUTTON: ".start-button",
  CANCEL_BUTTON: ".cancel-button",
  NOTIFICATION: ".notification",
  COMPUTER_BOARD: ".computer .game-board",
  PLAYER_BOARD: ".player .game-board",
  RANDOMIZE_BUTTON: ".randomize",
  GAME_BOARDS: ".game-board",
  GAME_OVER_MODAL: "#game-over-modal",
  PLAY_AGAIN: ".play-again",
  SOUND_ON: "#sound-on",
  MARK_VERIFIED: "#mark-verified",
  SHOW_TIMER: "#show-timer",
  GAME_TIMER: ".game-timer",
  TIMER_DISPLAY: ".timer-display",
  OUTCOME: ".outcome",
  SAVE_GAME_BUTTON: "[data-save-game-button]",
  SIGN_IN_TO_SAVE_BUTTON: "[data-sign-in-to-save-button]",
  GAME_SAVE_ERROR: "[data-game-save-error]",
  GAME_SAVE_SUCCESS: "[data-game-save-success]",
};

export const COLUMN_LABELS = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

