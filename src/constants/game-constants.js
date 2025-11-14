/**
 * Game constants and configuration
 */

export const BOARD_SIZE = 10;
export const SHIP_LENGTHS = [5, 4, 3, 3, 2];
export const SHIP_NAMES = {
  5: "Carrier",
  4: "Battleship",
  3: "Cruiser",
  2: "Destroyer",
};

export const PLAYERS = {
  PLAYER: "player",
  COMPUTER: "computer",
};

export const ORIENTATIONS = {
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
};

export const GAME_STATES = {
  SETUP: "setup",
  PLAYING: "playing",
  GAME_OVER: "game_over",
};
