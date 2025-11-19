import { SELECTORS } from "../views/ui-constants";

/**
 * GameTimer class manages the game timer functionality
 */
export default class GameTimer {
  constructor() {
    this.timerElement = document.querySelector(SELECTORS.GAME_TIMER);
    this.timerDisplay = document.querySelector(SELECTORS.TIMER_DISPLAY);
    this.showTimerCheckbox = document.querySelector(SELECTORS.SHOW_TIMER);
    this.intervalId = null;
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.isRunning = false;

    // Initialize visibility based on checkbox state
    this.updateVisibility();

    // Listen for checkbox changes
    if (this.showTimerCheckbox) {
      this.showTimerCheckbox.addEventListener("change", () => {
        this.updateVisibility();
      });
    }
  }

  /**
   * Update timer visibility based on checkbox state
   */
  updateVisibility() {
    if (!this.timerElement) return;

    const isChecked = this.showTimerCheckbox?.checked ?? true;

    if (isChecked) {
      this.timerElement.classList.remove("d-none");
    } else {
      this.timerElement.classList.add("d-none");
    }
  }

  /**
   * Start the timer
   */
  start() {
    if (this.isRunning) return;

    this.startTime = Date.now();
    this.elapsedSeconds = 0;
    this.isRunning = true;

    this.updateDisplay();

    // Update every second
    this.intervalId = setInterval(() => {
      this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);

      this.updateDisplay();
    }, 1000);
  }

  /**
   * Stop the timer
   */
  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);

      this.intervalId = null;
    }

    // Calculate final elapsed time
    if (this.startTime) {
      this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);

      this.updateDisplay();
    }
  }

  /**
   * Reset the timer
   */
  reset() {
    this.stop();

    this.elapsedSeconds = 0;
    this.startTime = null;

    this.updateDisplay();
  }

  /**
   * Get the current elapsed time in seconds
   * @returns {number} Elapsed time in seconds
   */
  getElapsedSeconds() {
    return this.elapsedSeconds;
  }

  /**
   * Update the timer display
   */
  updateDisplay() {
    if (!this.timerDisplay) return;

    const minutes = Math.floor(this.elapsedSeconds / 60);
    const seconds = this.elapsedSeconds % 60;

    this.timerDisplay.textContent = `${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }
}
