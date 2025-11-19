import authStore from "../state/auth-store";
import gamesService from "../api/games-service";
import { SELECTORS } from "./ui-constants";
import * as bootstrap from "bootstrap";

/**
 * Handles game saving functionality in the game over modal
 */
export function initializeGameSaveHandler() {
  const gameOverModal = document.querySelector(SELECTORS.GAME_OVER_MODAL);

  if (!gameOverModal) return;

  const saveGameButton = gameOverModal.querySelector(
    SELECTORS.SAVE_GAME_BUTTON
  );

  const signInToSaveButton = gameOverModal.querySelector(
    SELECTORS.SIGN_IN_TO_SAVE_BUTTON
  );

  const errorElement = gameOverModal.querySelector(SELECTORS.GAME_SAVE_ERROR);
  const successElement = gameOverModal.querySelector(
    SELECTORS.GAME_SAVE_SUCCESS
  );

  const authDialog = document.getElementById("auth-dialog");

  // Subscribe to auth state changes to update button visibility
  authStore.subscribe((state) => {
    updateSaveButtonVisibility(
      state,
      saveGameButton,
      signInToSaveButton,
      gameOverModal
    );
  });

  // Handle save game button click
  if (saveGameButton) {
    saveGameButton.addEventListener("click", async () => {
      await handleSaveGame(
        gameOverModal,
        errorElement,
        successElement,
        saveGameButton
      );
    });
  }

  // Handle sign in to save button click
  if (signInToSaveButton) {
    signInToSaveButton.addEventListener("click", () => {
      const modal = bootstrap.Modal.getInstance(gameOverModal);

      if (modal) {
        modal.hide();
      }

      if (authDialog) {
        const authModal = new bootstrap.Modal(authDialog);

        authModal.show();

        // After successful auth, show game over modal again
        const unsubscribe = authStore.subscribe((state) => {
          if (state.isAuthenticated) {
            unsubscribe();
            authModal.hide();

            // Show game over modal again after a short delay
            setTimeout(() => {
              const gameOverModalInstance = new bootstrap.Modal(gameOverModal);
              gameOverModalInstance.show();
            }, 300);
          }
        });
      }
    });
  }

  // Update button visibility when modal is shown
  gameOverModal.addEventListener("show.bs.modal", () => {
    const state = authStore.getState();

    updateSaveButtonVisibility(
      state,
      saveGameButton,
      signInToSaveButton,
      gameOverModal
    );
  });
}

function updateSaveButtonVisibility(
  authState,
  saveGameButton,
  signInToSaveButton,
  gameOverModal
) {
  const gameData = gameOverModal.dataset.gameData;

  if (!gameData) {
    // No game data, hide both buttons
    if (saveGameButton) saveGameButton.classList.add("d-none");
    if (signInToSaveButton) signInToSaveButton.classList.add("d-none");

    return;
  }

  if (authState.isAuthenticated) {
    // User is authenticated, show save button
    if (saveGameButton) saveGameButton.classList.remove("d-none");
    if (signInToSaveButton) signInToSaveButton.classList.add("d-none");
  } else {
    // User is not authenticated, show sign in button
    if (saveGameButton) saveGameButton.classList.add("d-none");
    if (signInToSaveButton) signInToSaveButton.classList.remove("d-none");
  }
}

async function handleSaveGame(
  gameOverModal,
  errorElement,
  successElement,
  saveGameButton
) {
  const gameDataStr = gameOverModal.dataset.gameData;

  if (!gameDataStr) {
    return;
  }

  try {
    const gameData = JSON.parse(gameDataStr);
    saveGameButton.disabled = true;

    // Hide previous messages
    if (errorElement) {
      errorElement.classList.add("d-none");
      errorElement.textContent = "";
    }

    if (successElement) {
      successElement.classList.add("d-none");
    }

    await gamesService.createGame(gameData);

    // Show success message
    if (successElement) {
      successElement.classList.remove("d-none");
    }

    // Hide save button after successful save
    saveGameButton.classList.add("d-none");
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to save game. Please try again.";

    if (errorElement) {
      errorElement.textContent = Array.isArray(message)
        ? message.join(" ")
        : message;
      errorElement.classList.remove("d-none");
    }
  } finally {
    saveGameButton.disabled = false;
  }
}
