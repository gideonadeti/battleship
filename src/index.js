// Import dependencies and modules
import "./index.scss";
import * as bootstrap from "bootstrap";
import UI from "./views/ui";
import createPlayers from "./models/create-players";
import GameController from "./game/game-controller";
import playSound from "./models/sounds";
import { initializeAuthDialog } from "./views/auth-dialog";

let player, computer;
let gameController = null;
let startGameHandler = null;
let cancelGameHandler = null;

function playGame() {
  UI.initialize();

  // Reset UI to setup state (shows start button, fades computer board)
  UI.resetToSetupState();

  // Create new players each time playGame is called
  ({ player, computer } = createPlayers());

  UI.renderBoards([player, computer]);

  // Cleanup previous game controller if it exists
  if (gameController) {
    gameController.cleanup();
    gameController = null;
  }

  // Remove previous start button event listener if it exists
  if (startGameHandler) {
    UI.startButton.removeEventListener("click", startGameHandler);
    startGameHandler = null;
  }

  // Remove previous cancel button event listener if it exists
  if (cancelGameHandler) {
    UI.cancelButton.removeEventListener("click", cancelGameHandler);
    cancelGameHandler = null;
  }

  // Create new handler for the current game
  startGameHandler = () => {
    UI.showComputerBoard();

    // Create new game controller instance
    gameController = new GameController(player, computer);
    gameController.initialize();

    UI.randomizeButton.disabled = true;
  };

  // Create cancel game handler
  cancelGameHandler = () => {
    // Reset the game controller
    if (gameController) {
      gameController.cleanup();
      gameController = null;
    }

    // Reset UI to setup state
    UI.fadeComputerBoard();
    UI.updateNotification("Place your ships.");
    UI.randomizeButton.disabled = false;
    playSound("click");
    
    // Reset the game (this will create new players and boards)
    playGame();
  };

  // Add event listeners
  UI.startButton.addEventListener("click", startGameHandler);
  UI.cancelButton.addEventListener("click", cancelGameHandler);
}

document.addEventListener("DOMContentLoaded", () => {
  initializeAuthDialog();

  playGame();

  UI.randomizeButton.addEventListener("click", () => {
    playSound("click");
    playGame();
  });

  UI.playAgainButton.addEventListener("click", () => {
    playSound("click");
    playGame(); // playGame() now calls resetToSetupState() which handles everything
  });
});
