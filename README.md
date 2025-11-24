# Battleship

A modern web-based implementation of the classic Battleship game, built with vanilla JavaScript, SCSS, and Bootstrap. This project was developed as part of The Odin Project curriculum to practice Test-Driven Development (TDD) and complex DOM manipulation.

**[Play the game live](https://gideonadeti.github.io/battleship)**

## Table of Contents

- [Battleship](#battleship)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
    - [Core Gameplay](#core-gameplay)
    - [Ship Placement](#ship-placement)
    - [AI Opponent](#ai-opponent)
    - [User Experience](#user-experience)
    - [Game Features](#game-features)
  - [Screenshots](#screenshots)
    - [Desktop (MacBook Air)](#desktop-macbook-air)
    - [Tablet (iPad Pro 11")](#tablet-ipad-pro-11)
    - [Mobile (iPhone 13 Pro)](#mobile-iphone-13-pro)
  - [Technologies Used](#technologies-used)
    - [Frontend](#frontend)
    - [Build Tools](#build-tools)
    - [Testing](#testing)
    - [Development](#development)
  - [Project History](#project-history)
  - [Running Locally](#running-locally)
    - [Prerequisites](#prerequisites)
    - [Setup Steps](#setup-steps)
    - [Building for Production](#building-for-production)
    - [Running Tests](#running-tests)
    - [Deployment](#deployment)
  - [Future Improvements](#future-improvements)
  - [Acknowledgments](#acknowledgments)
  - [Contributing](#contributing)
  - [Support](#support)

## Features

### Core Gameplay

- **Classic Battleship Rules**: Sink all opponent ships before they sink yours
- **5 Ship Types**: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2)
- **10x10 Grid**: Standard battleship board size
- **Turn-based Combat**: Players alternate turns, with consecutive turns on successful hits

### Ship Placement

- **Drag & Drop**: Manually place ships by dragging them to desired positions
- **Ship Rotation**: Double-click any ship to rotate between horizontal and vertical orientations
- **Random Placement**: One-click randomize button for quick ship placement
- **Visual Feedback**: Real-time preview of valid/invalid placement positions

### AI Opponent

- **Smart Attack Algorithm**: Computer uses intelligent targeting after hitting a ship
- **Realistic Delays**: Random delays between moves to mimic human response time
- **Adaptive Strategy**: AI adjusts attack patterns based on hit patterns

### User Experience

- **Sound Effects**: Immersive audio feedback for all game actions
  - Game start and win/lose outcomes
  - Hit (wounded), miss, and ship sinking (killed) sounds
  - UI button interactions (click)
- **Visual Indicators**:
  - "X" markers (in red) for hits
  - "O" markers (in blue) for misses
  - "O" markers with light blue background for verified empty cells (optional)
- **Settings Panel**:
  - Toggle verified empty cell marking
  - Enable/disable sound effects
- **Responsive Design**: Works on desktop and mobile devices

### Game Features

- **Verified Empty Cells**: Automatically mark cells adjacent to sunk ships (optional)
- **Game State Management**: Proper handling of setup, playing, and game over states
- **Play Again**: Quick restart functionality
- **Cancel Game**: Return to setup phase before starting

## Screenshots

### Desktop (MacBook Air)

<table>
  <tr>
    <td>
      <img src="src/assets/screenshots/Macbook-Air-gideonadeti.github.io%20(3).png" alt="Playing Battleship on desktop with both boards visible" />
    </td>
    <td>
      <img src="src/assets/screenshots/Macbook-Air-gideonadeti.github.io%20(4).png" alt="Desktop game-over screen showing a victory dialog" />
    </td>
  </tr>
</table>

### Tablet (iPad Pro 11")

<table>
  <tr>
    <td>
      <img src="src/assets/screenshots/iPad-PRO-11-gideonadeti.github.io%20(2).png" alt="Tablet game-over screen showing a defeat dialog" />
    </td>
  </tr>
</table>

### Mobile (iPhone 13 Pro)

<table>
  <tr>
    <td>
      <img src="src/assets/screenshots/iPhone-13-PRO-gideonadeti.github.io%20(1).png" alt="Mobile game-over screen showing a defeat dialog" />
    </td>
  </tr>
</table>

## Technologies Used

### Frontend

- **HTML5**: Semantic markup
- **SCSS**: Styling with variables and mixins
- **JavaScript (ES6+)**: Modern JavaScript features
- **Bootstrap 5.3**: Responsive UI framework
- **Bootstrap Icons**: Icon library

### Build Tools

- **Webpack 5**: Module bundler
- **Babel**: JavaScript transpiler
- **Sass/SCSS Loader**: CSS preprocessing
- **PostCSS & Autoprefixer**: CSS optimization

### Testing

- **Jest**: Testing framework
- **Babel Jest**: ES6+ support for tests

### Development

- **Webpack Dev Server**: Hot module replacement
- **HTML Webpack Plugin**: HTML generation
- **Copy Webpack Plugin**: Asset management

## Project History

This is the **third version** of my Battleship implementation, showcasing the evolution and improvement of my web development skills over time:

- **v1** - [GitHub](https://github.com/Gideon-D-Adeti/battleship) | [Live Demo](https://gideon-d-adeti.github.io/battleship)
- **v2** - [GitHub](https://github.com/GDA0/battleship) | [Live Demo](https://gda0.github.io/battleship/)
- **v3** (Current) - [GitHub](https://github.com/gideonadeti/battleship) | [Live Demo](https://gideonadeti.github.io/battleship)

Each version demonstrates progress in code organization, feature implementation, and overall game polish.

## Running Locally

### Prerequisites

- Node.js (v14 or higher)
- A Node.js package manager (npm, yarn, pnpm, bun, etc.)

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/gideonadeti/battleship.git
   cd battleship
   ```

2. **Install dependencies** (using bun as an example; any package manager works)

   ```bash
   bun install
   ```

3. **Start the development server**

   ```bash
   bun start
   ```

   The game will open automatically in your browser at `http://localhost:8080` (or the next available port).

### Building for Production

Create an optimized bundle in `dist/`:

```bash
bun run build
# or: npm run build, yarn build, pnpm build, etc.
```

### Running Tests

Execute the Jest suite to verify core logic:

```bash
bun test
# or: npm test, yarn test, pnpm test, etc.
```

Core test coverage includes:

- Ship model functionality
- Game board operations
- Player actions
- Computer AI logic
- Game controller flow
- UI drag-and-drop interactions

### Deployment

Ship the latest build to GitHub Pages (or your preferred platform):

```bash
bun run deploy
# or: npm run deploy, yarn deploy, pnpm deploy, etc.
```

## Future Improvements

This project keeps evolving alongside my other portfolio pieces. Upcoming enhancements include:

- **Leaderboard Integration**: Connect gameplay stats to the [Real-time Leaderboard](https://github.com/gideonadeti/realtime-leaderboard) ecosystem with opt-in score saving and real-time ranking updates across games.
- More features coming soon...

## Acknowledgments

This project was built as part of my web development learning journey using [The Odin Project](https://www.theodinproject.com) curriculum. Special thanks to:

- [The Odin Project](https://www.theodinproject.com) for providing the [Battleship project lesson](https://www.theodinproject.com/lessons/node-path-javascript-battleship) and comprehensive curriculum
- The classic Battleship game for the timeless gameplay mechanics

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## Support

If you find this project helpful or interesting, consider supporting me:

[Buy me a coffee](https://buymeacoffee.com/gideonadeti)

---

**Enjoy playing Battleship! May the best strategist win!**
