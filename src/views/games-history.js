import * as bootstrap from "bootstrap";
import gamesService from "../api/games-service";
import { formatDuration } from "../utils/duration-formatter";

class GamesHistory {
  constructor() {
    this.modalElement = document.getElementById("games-history-modal");
    this.contentElement = document.querySelector(
      "[data-games-history-content]"
    );
    this.loadingElement = document.querySelector(
      "[data-games-history-loading]"
    );
    this.errorElement = document.querySelector("[data-games-history-error]");
    this.emptyElement = document.querySelector("[data-games-history-empty]");
    this.theadElement = document.querySelector("[data-games-history-thead]");
    this.tbodyElement = document.querySelector("[data-games-history-tbody]");
    this.filtersElement = document.querySelector(
      "[data-games-history-filters]"
    );
    this.paginationElement = document.querySelector(
      "[data-games-history-pagination]"
    );

    this.countElement = document.querySelector("[data-games-history-count]");
    this.pageInfoElement = document.querySelector(
      "[data-games-history-page-info]"
    );

    this.prevButton = document.querySelector("[data-games-history-prev]");
    this.nextButton = document.querySelector("[data-games-history-next]");
    this.games = [];
    this.filteredGames = [];
    this.currentFilter = "all";
    this.state = {
      sorting: {
        columnId: null,
        direction: null, // 'asc' or 'desc'
      },
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    };

    if (this.modalElement) {
      this.modal = new bootstrap.Modal(this.modalElement);

      // Fetch games when modal is shown
      this.modalElement.addEventListener("show.bs.modal", () => {
        this.loadGames();
      });

      // Reset state when modal is hidden
      this.modalElement.addEventListener("hidden.bs.modal", () => {
        this.resetState();
      });
    }

    this.setupFilterButtons();
    this.setupPaginationButtons();
  }

  setupFilterButtons() {
    if (!this.filtersElement) return;

    this.filtersElement.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-filter]");

      if (!button) return;

      const filter = button.getAttribute("data-filter");
      this.setFilter(filter);
    });
  }

  setupPaginationButtons() {
    if (this.prevButton) {
      this.prevButton.addEventListener("click", () => {
        this.state.pagination.pageIndex = Math.max(
          0,
          this.state.pagination.pageIndex - 1
        );

        this.renderTable();
      });
    }

    if (this.nextButton) {
      this.nextButton.addEventListener("click", () => {
        const maxPageIndex =
          Math.ceil(
            this.filteredGames.length / this.state.pagination.pageSize
          ) - 1;

        this.state.pagination.pageIndex = Math.min(
          maxPageIndex,
          this.state.pagination.pageIndex + 1
        );

        this.renderTable();
      });
    }
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.state.pagination.pageIndex = 0; // Reset to first page

    // Update filter button states
    if (this.filtersElement) {
      this.filtersElement
        .querySelectorAll("button[data-filter]")
        .forEach((btn) => {
          btn.classList.toggle(
            "active",
            btn.getAttribute("data-filter") === filter
          );
        });
    }

    this.applyFilters();
    this.renderTable();
  }

  applyFilters() {
    if (this.currentFilter === "all") {
      this.filteredGames = [...this.games];
    } else {
      this.filteredGames = this.games.filter(
        (game) => game.outcome === this.currentFilter
      );
    }
  }

  async loadGames() {
    this.showLoading();
    this.hideError();
    this.hideContent();
    this.hideEmpty();

    try {
      const games = await gamesService.getGames();
      this.games = games || [];
      this.applyFilters();
      this.renderTable();
      this.hideLoading();

      if (this.filteredGames.length === 0) {
        this.showEmpty();
      } else {
        this.showContent();
      }
    } catch (error) {
      this.hideLoading();
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load game history. Please try again.";
      this.showError(message);
    }
  }

  getSortedGames() {
    if (!this.state.sorting.columnId) {
      return this.filteredGames;
    }

    const sorted = [...this.filteredGames];
    const { columnId, direction } = this.state.sorting;

    sorted.sort((a, b) => {
      let aValue, bValue;

      switch (columnId) {
        case "date":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();

          break;
        case "duration":
          aValue = a.duration;
          bValue = b.duration;

          break;
        case "outcome":
          aValue = a.outcome;
          bValue = b.outcome;

          break;
        default:
          return 0;
      }

      let comparison = 0;

      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }

      return direction === "desc" ? -comparison : comparison;
    });

    return sorted;
  }

  getPaginatedGames() {
    const sorted = this.getSortedGames();
    const { pageIndex, pageSize } = this.state.pagination;
    const start = pageIndex * pageSize;
    const end = start + pageSize;

    return sorted.slice(start, end);
  }

  renderTable() {
    const columns = [
      { id: "date", header: "Date" },
      { id: "duration", header: "Duration" },
      { id: "outcome", header: "Outcome" },
      { id: "actions", header: "Actions" },
    ];

    // Render header
    if (this.theadElement) {
      this.theadElement.innerHTML = `<tr>
        ${columns
          .map((column) => {
            const isSorted = this.state.sorting.columnId === column.id;
            const sortDirection = this.state.sorting.direction;
            const sortIcon =
              sortDirection === "asc"
                ? '<i class="bi bi-arrow-up"></i>'
                : sortDirection === "desc"
                ? '<i class="bi bi-arrow-down"></i>'
                : '<i class="bi bi-arrow-down-up text-secondary"></i>';

            if (column.id === "actions") {
              return `<th>${column.header}</th>`;
            }

            return `<th 
              style="cursor: pointer; user-select: none;"
              onclick="window.gamesHistoryInstance?.handleSort('${column.id}')"
            >
              <div class="d-flex align-items-center gap-2">
                ${column.header}
                ${
                  isSorted
                    ? sortIcon
                    : '<i class="bi bi-arrow-down-up text-secondary"></i>'
                }
              </div>
            </th>`;
          })
          .join("")}
      </tr>`;
    }

    // Get paginated games
    const paginatedGames = this.getPaginatedGames();

    // Render body
    if (this.tbodyElement) {
      if (paginatedGames.length === 0) {
        this.tbodyElement.innerHTML = `<tr><td colspan="4" class="text-center text-secondary">No games found.</td></tr>`;
      } else {
        this.tbodyElement.innerHTML = paginatedGames
          .map((game) => {
            const date = new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }).format(new Date(game.createdAt));

            const duration = formatDuration(game.duration);
            const isWon = game.outcome === "WON";
            const badgeClass = isWon ? "badge bg-success" : "badge bg-danger";
            const outcomeText = isWon ? "Won" : "Lost";

            return `<tr>
              <td>${date}</td>
              <td>${duration}</td>
              <td><span class="${badgeClass}">${outcomeText}</span></td>
              <td>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  data-delete-game="${game.id}"
                  title="Delete game"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>`;
          })
          .join("");

        // Set up delete button event listeners
        this.setupDeleteButtons();
      }
    }

    // Update pagination info
    this.updatePaginationInfo();
  }

  setupDeleteButtons() {
    if (!this.tbodyElement) return;

    const deleteButtons =
      this.tbodyElement.querySelectorAll("[data-delete-game]");

    deleteButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const gameId = event.currentTarget.getAttribute("data-delete-game");
        this.handleDelete(gameId);
      });
    });
  }

  async handleDelete(gameId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this game? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await gamesService.deleteGame(gameId);

      // Remove the game from local state
      this.games = this.games.filter((game) => game.id !== gameId);
      this.applyFilters();

      // Adjust page index if current page becomes empty
      const totalPages = Math.ceil(
        this.filteredGames.length / this.state.pagination.pageSize
      );
      if (
        this.state.pagination.pageIndex >= totalPages &&
        this.state.pagination.pageIndex > 0
      ) {
        this.state.pagination.pageIndex = totalPages - 1;
      }

      // Re-render the table
      this.renderTable();

      // Show empty state if no games left
      if (this.filteredGames.length === 0) {
        this.showEmpty();
        this.hideContent();
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete game. Please try again.";
      this.showError(message);
    }
  }

  handleSort(columnId) {
    const currentColumnId = this.state.sorting.columnId;
    const currentDirection = this.state.sorting.direction;

    if (currentColumnId !== columnId) {
      // New column, sort ascending
      this.state.sorting = { columnId, direction: "asc" };
    } else if (currentDirection === "asc") {
      // Same column, switch to descending
      this.state.sorting = { columnId, direction: "desc" };
    } else {
      // Same column, clear sorting
      this.state.sorting = { columnId: null, direction: null };
    }

    this.state.pagination.pageIndex = 0; // Reset to first page
    this.renderTable();
  }

  updatePaginationInfo() {
    const totalRows = this.filteredGames.length;
    const { pageIndex, pageSize } = this.state.pagination;
    const start = totalRows > 0 ? pageIndex * pageSize + 1 : 0;
    const end = Math.min((pageIndex + 1) * pageSize, totalRows);
    const totalPages = Math.ceil(totalRows / pageSize);

    if (this.countElement) {
      if (totalRows === 0) {
        this.countElement.textContent = "No games found";
      } else {
        this.countElement.textContent = `Showing ${start}-${end} of ${totalRows} games`;
      }
    }

    if (this.pageInfoElement) {
      this.pageInfoElement.textContent = `Page ${pageIndex + 1} of ${
        totalPages || 1
      }`;
    }

    if (this.prevButton) {
      this.prevButton.disabled = pageIndex === 0;
    }

    if (this.nextButton) {
      this.nextButton.disabled =
        pageIndex >= totalPages - 1 || totalPages === 0;
    }
  }

  show() {
    this.modal?.show();
  }

  showLoading() {
    if (this.loadingElement) {
      this.loadingElement.classList.remove("d-none");
    }
  }

  hideLoading() {
    if (this.loadingElement) {
      this.loadingElement.classList.add("d-none");
    }
  }

  showError(message) {
    if (this.errorElement) {
      this.errorElement.textContent = message;
      this.errorElement.classList.remove("d-none");
    }
  }

  hideError() {
    if (this.errorElement) {
      this.errorElement.classList.add("d-none");
    }
  }

  showContent() {
    if (this.contentElement) {
      this.contentElement.classList.remove("d-none");
    }
  }

  hideContent() {
    if (this.contentElement) {
      this.contentElement.classList.add("d-none");
    }
  }

  showEmpty() {
    if (this.emptyElement) {
      this.emptyElement.classList.remove("d-none");
    }
  }

  hideEmpty() {
    if (this.emptyElement) {
      this.emptyElement.classList.add("d-none");
    }
  }

  resetState() {
    this.currentFilter = "all";
    this.state = {
      sorting: {
        columnId: null,
        direction: null,
      },
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    };
    this.games = [];
    this.filteredGames = [];
  }
}

let gamesHistoryInstance = null;

export const initializeGamesHistory = () => {
  if (!document.getElementById("games-history-modal")) {
    return null;
  }

  gamesHistoryInstance = new GamesHistory();
  // Make instance available globally for onclick handlers
  window.gamesHistoryInstance = gamesHistoryInstance;

  return gamesHistoryInstance;
};
