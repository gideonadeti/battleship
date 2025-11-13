// Import dependencies and modules
import "./index.scss";
import * as bootstrap from "bootstrap";
import UI from "./views/ui";
import createPlayers from "./models/create-players";
import GameController from "./game/game-controller";
import playSound from "./models/sounds";

let player, computer;
let gameController = null;
let startGameHandler = null;

function playGame() {
  UI.initialize();

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

  // Create new handler for the current game
  startGameHandler = () => {
    UI.showComputerBoard();

    // Create new game controller instance
    gameController = new GameController(player, computer);
    gameController.initialize();

    UI.randomizeButton.disabled = true;
  };

  // Add event listener
  UI.startButton.addEventListener("click", startGameHandler);
}

document.addEventListener("DOMContentLoaded", () => {
  playGame();

  UI.randomizeButton.addEventListener("click", () => {
    playSound("click");
    playGame();
  });

  UI.playAgainButton.addEventListener("click", () => {
    UI.fadeComputerBoard();
    UI.updateNotification("Place your ships.");
    UI.randomizeButton.disabled = false;
    playSound("click");
    playGame();
  });
});
