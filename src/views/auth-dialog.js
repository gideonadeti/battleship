import * as bootstrap from "bootstrap";

import authService from "../api/auth-service";
import authStore from "../state/auth-store";

class AuthDialog {
  constructor() {
    this.modalElement = document.getElementById("auth-dialog");
    this.trigger = document.querySelector("[data-auth-dialog-trigger]");
    this.body = this.modalElement?.querySelector("[data-auth-dialog-body]");
    this.errorElement = this.modalElement?.querySelector(
      "[data-auth-dialog-error]"
    );

    this.mode = "signIn";
    this.isSubmitting = false;
    this.errorMessage = "";

    if (this.modalElement) {
      this.modal = new bootstrap.Modal(this.modalElement);
    }

    if (this.trigger) {
      this.trigger.addEventListener("click", () => {
        this.modal?.show();
      });
    }

    authStore.subscribe((state) => {
      this.render(state);
    });
  }

  setMode(mode) {
    this.mode = mode;
    this.render(authStore.getState());
  }

  setError(message) {
    this.errorMessage = message;

    if (this.errorElement) {
      this.errorElement.textContent = message || "";
      this.errorElement.classList.toggle("d-none", !message);
    }
  }

  handleSignOut() {
    authService.signOut();

    this.mode = "signIn";

    this.setError("");
    this.render(authStore.getState());
  }

  async handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and all your saved game data will be permanently deleted."
    );

    if (!confirmed) return;

    this.isSubmitting = true;

    this.setError("");

    try {
      await authService.deleteAccount();

      this.mode = "signIn";

      this.render(authStore.getState());
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete account. Please try again.";

      this.setError(Array.isArray(message) ? message.join(" ") : message);
    } finally {
      this.isSubmitting = false;
    }
  }

  async handleSubmit(event) {
    event.preventDefault();

    if (this.isSubmitting) return;

    const formData = new FormData(event.target);
    const credentials = {
      username: formData.get("username")?.trim(),
      password: formData.get("password")?.trim(),
    };

    if (!credentials.username || !credentials.password) {
      this.setError("Username and password are required.");

      return;
    }

    this.isSubmitting = true;

    this.setError("");

    const submitButton = event.target.querySelector("button[type='submit']");

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      if (this.mode === "signIn") {
        await authService.signIn(credentials);
      } else {
        await authService.signUp(credentials);
      }

      this.mode = "signIn";

      event.target.reset();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again.";

      this.setError(Array.isArray(message) ? message.join(" ") : message);
    } finally {
      this.isSubmitting = false;

      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  }

  renderUnauthenticated() {
    return `
      <div class="auth-dialog-form">
        <p class="text-secondary small mb-3">
          Sign in to save your games and compete on the leaderboard.
        </p>
        <form data-auth-form>
          <div class="mb-3">
            <label class="form-label" for="auth-username">Username</label>
            <input
              class="form-control"
              id="auth-username"
              name="username"
              type="text"
              autocomplete="username"
              required
            />
          </div>
          <div class="mb-3">
            <label class="form-label" for="auth-password">Password</label>
            <input
              class="form-control"
              id="auth-password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
            />
          </div>
          <div
            class="alert alert-danger py-2 d-none"
            role="alert"
            data-auth-dialog-error
          ></div>
          <button type="submit" class="btn btn-primary w-100 mb-2">
            ${this.mode === "signIn" ? "Sign In" : "Create Account"}
          </button>
          <button
            type="button"
            class="btn btn-link w-100 p-0 auth-toggle-mode"
          >
            ${
              this.mode === "signIn"
                ? "Need an account? Sign up"
                : "Already registered? Sign in"
            }
          </button>
        </form>
      </div>
    `;
  }

  renderAuthenticated(state) {
    const username = state.player?.username ?? "Player";
    const playerId = state.player?.id ?? "unknown";
    const profileUrl = authService.getProfileUrl(playerId);

    return `
      <div class="auth-dialog-profile d-flex align-items-center gap-3">
        <div class="auth-avatar rounded-circle d-inline-flex justify-content-center align-items-center">
          <i class="bi bi-person"></i>
        </div>
        <div class="flex-grow-1">
          <p class="mb-1 text-secondary small">Signed in as</p>
          <a href="${profileUrl}" target="_blank" rel="noopener noreferrer" class="fw-semibold link-primary text-decoration-none" title="View profile">
            ${username}
          </a>
        </div>
      </div>
      <hr />
      <button
        type="button"
        class="btn btn-outline-primary w-100 mb-2"
        data-games-history-trigger
      >
        <i class="bi bi-clock-history"></i> View Game History
      </button>
      <button
        type="button"
        class="btn btn-outline-danger w-100 mb-2"
        data-auth-sign-out
      >
        Sign Out
      </button>
      <button
        type="button"
        class="btn btn-outline-danger w-100"
        data-auth-delete-account
      >
        Delete Account
      </button>
    `;
  }

  render(state) {
    if (!this.body) return;

    const isAuthenticated = state?.isAuthenticated;
    const content = isAuthenticated
      ? this.renderAuthenticated(state)
      : this.renderUnauthenticated();

    this.body.innerHTML = `
      ${content}
      <div class="mt-3 text-center">
        <a href="${authService.getLeaderboardAppUrl()}" target="_blank" rel="noopener noreferrer">
          Visit Leaderboard App
        </a>
      </div>
    `;

    this.errorElement = this.body.querySelector("[data-auth-dialog-error]");

    if (this.errorMessage && this.errorElement) {
      this.errorElement.textContent = this.errorMessage;
      this.errorElement.classList.remove("d-none");
    }

    const form = this.body.querySelector("[data-auth-form]");

    if (form && !isAuthenticated) {
      form.addEventListener("submit", (event) => this.handleSubmit(event));
    }

    const toggleButton = this.body.querySelector(".auth-toggle-mode");

    if (toggleButton) {
      toggleButton.addEventListener("click", () => {
        this.setMode(this.mode === "signIn" ? "signUp" : "signIn");
      });
    }

    const signOutButton = this.body.querySelector("[data-auth-sign-out]");

    if (signOutButton) {
      signOutButton.addEventListener("click", () => this.handleSignOut());
    }

    const deleteAccountButton = this.body.querySelector(
      "[data-auth-delete-account]"
    );

    if (deleteAccountButton) {
      deleteAccountButton.addEventListener("click", () =>
        this.handleDeleteAccount()
      );
    }

    const gamesHistoryButton = this.body.querySelector(
      "[data-games-history-trigger]"
    );

    if (gamesHistoryButton) {
      gamesHistoryButton.addEventListener("click", () => {
        this.modal?.hide();
        if (window.gamesHistoryInstance) {
          window.gamesHistoryInstance.show();
        }
      });
    }
  }
}

export const initializeAuthDialog = () => {
  if (!document.getElementById("auth-dialog")) {
    return null;
  }

  const dialog = new AuthDialog();

  return dialog;
};
