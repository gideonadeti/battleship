import { GAME_STATES } from "../constants/game-constants";

/**
 * GameState class manages the current state of the game
 */
export default class GameState {
  constructor() {
    this.state = GAME_STATES.SETUP;
    this.currentPlayer = null;
    this.winner = null;
  }

  /**
   * Set the game state
   * @param {string} newState - The new game state
   */
  setState(newState) {
    if (Object.values(GAME_STATES).includes(newState)) {
      this.state = newState;
    } else {
      throw new Error(`Invalid game state: ${newState}`);
    }
  }

  /**
   * Get the current game state
   * @returns {string} The current game state
   */
  getState() {
    return this.state;
  }

  /**
   * Check if the game is in a specific state
   * @param {string} state - The state to check
   * @returns {boolean} True if the game is in the specified state
   */
  isState(state) {
    return this.state === state;
  }

  /**
   * Set the current player
   * @param {string} player - The current player
   */
  setCurrentPlayer(player) {
    this.currentPlayer = player;
  }

  /**
   * Get the current player
   * @returns {string} The current player
   */
  getCurrentPlayer() {
    return this.currentPlayer;
  }

  /**
   * Set the winner
   * @param {string} winner - The winner of the game
   */
  setWinner(winner) {
    this.winner = winner;
    this.state = GAME_STATES.GAME_OVER;
  }

  /**
   * Get the winner
   * @returns {string} The winner of the game
   */
  getWinner() {
    return this.winner;
  }

  /**
   * Reset the game state
   */
  reset() {
    this.state = GAME_STATES.SETUP;
    this.currentPlayer = null;
    this.winner = null;
  }
}
