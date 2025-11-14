/**
 * DOM helper functions for testing
 */

/**
 * Create a mock DOM element (works with jsdom)
 * @param {string} tagName - HTML tag name
 * @param {Object} options - Element options
 * @param {boolean} useRealDOM - Whether to use real DOM element (default: true for jsdom)
 * @returns {Object|HTMLElement} Mock or real DOM element
 */
export function createMockElement(
  tagName = "div",
  options = {},
  useRealDOM = true
) {
  let element;

  if (useRealDOM && typeof document !== "undefined" && document.createElement) {
    // Use real DOM element (jsdom environment)
    element = document.createElement(tagName);

    // Apply classList operations
    if (options.className) {
      element.className = options.className;
    }
    if (options.classList) {
      options.classList.forEach((cls) => element.classList.add(cls));
    }

    // Apply dataset
    if (options.dataset) {
      Object.assign(element.dataset, options.dataset);
    }

    // Apply other properties
    Object.keys(options).forEach((key) => {
      if (
        key !== "className" &&
        key !== "classList" &&
        key !== "dataset" &&
        key !== "children"
      ) {
        element[key] = options[key];
      }
    });
  } else {
    // Use mock object (for non-DOM environments)
    element = {
      tagName: tagName.toUpperCase(),
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(() => false),
        toggle: jest.fn(),
      },
      dataset: {},
      style: {},
      textContent: "",
      innerHTML: "",
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      cloneNode: jest.fn(function (deep) {
        return createMockElement(this.tagName.toLowerCase(), options, false);
      }),
      parentNode: null,
      children: [],
    };

    // Merge options
    Object.assign(element, options);
  }

  return element;
}

/**
 * Create a cell element for game board
 * @param {number} row - Row number (1-indexed)
 * @param {number} col - Column number (1-indexed)
 * @param {Array<string>} classes - Additional CSS classes
 * @returns {HTMLElement} Cell element
 */
export function createCellElement(row, col, classes = []) {
  const cell = createMockElement("div", {
    dataset: { row: row.toString(), col: col.toString() },
    classList: ["cell", ...classes],
  });
  return cell;
}

/**
 * Create a mock game board element
 * @param {number} size - Board size (default: 10)
 * @returns {HTMLElement} Mock game board element
 */
export function createMockGameBoard(size = 10) {
  const board = createMockElement("div", {
    className: "game-board",
  });

  // Add cells
  const cells = [];
  for (let row = 1; row <= size; row++) {
    for (let col = 1; col <= size; col++) {
      const cell = createCellElement(row, col);
      board.appendChild(cell);
      cells.push(cell);
    }
  }

  // Override querySelector to find cells by data attributes
  board.querySelector = jest.fn((selector) => {
    if (typeof selector === "string") {
      // Match data-row and data-col attributes
      const rowMatch = selector.match(/data-row="(\d+)"/);
      const colMatch = selector.match(/data-col="(\d+)"/);

      if (rowMatch && colMatch) {
        const row = parseInt(rowMatch[1], 10);
        const col = parseInt(colMatch[1], 10);
        return (
          cells.find(
            (cell) =>
              cell.dataset.row === row.toString() &&
              cell.dataset.col === col.toString()
          ) || null
        );
      }
    }
    return null;
  });

  return board;
}
