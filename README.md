# Battleship

A modern web-based implementation of the classic Battleship game, built with vanilla JavaScript, SCSS, and Bootstrap. This project was developed as part of The Odin Project curriculum to practice Test-Driven Development (TDD) and complex DOM manipulation.

## 🎮 Features

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

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- A Node.js package manager (npm, yarn, pnpm, bun, etc.)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/gideonadeti/battleship.git
cd battleship
```

2. Install dependencies (using npm as an example; any package manager works):

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The game will open automatically in your browser at `http://localhost:8080` (or the next available port).

### Building for Production

To create a production build:

```bash
npm run build
# or: yarn build, pnpm build, bun build, etc.
```

The optimized files will be in the `dist/` directory.

### Running Tests

Run the test suite with Jest:

```bash
npm test
# or: yarn test, pnpm test, bun test, etc.
```

### Deployment

Deploy to GitHub Pages:

```bash
npm run deploy
# or: yarn deploy, pnpm deploy, bun deploy, etc.
```

## 🎯 How to Play

1. **Setup Phase**:
   - Ships are randomly placed at the start
   - Drag and drop ships to reposition them
   - Double-click ships to rotate them
   - Use "Randomize" to get new random placements
   - Click "Start Game" when ready

2. **Gameplay**:
   - Click on the computer's board to attack
   - "X" markers (in red) indicate hits, "O" markers (in blue) indicate misses
   - When you hit a ship, you get another turn
   - Sink all enemy ships to win!

3. **Settings**:
   - **Mark verified empty cells**: Shows "O" on cells adjacent to sunk ships
   - **Sound on**: Toggle game sound effects

For detailed instructions, click the info icon (ℹ️) in the game interface.

## 🛠️ Tech Stack

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

## 🧪 Testing

This project follows Test-Driven Development (TDD) principles. Tests cover:

- Ship model functionality
- Game board operations
- Player actions
- Computer AI logic
- Game controller flow
- UI drag and drop interactions

Run tests with:

```bash
npm test
```

## 🎨 Design Philosophy

- **Separation of Concerns**: Models, views, and controllers are clearly separated
- **Modular Architecture**: Each component has a single responsibility
- **Test-Driven Development**: Comprehensive test coverage
- **User Experience First**: Intuitive controls and visual feedback
- **Performance**: Optimized rendering and efficient algorithms

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Gideon Adeti**

- GitHub: [@gideonadeti](https://github.com/gideonadeti)
- Project Link: [https://github.com/gideonadeti/battleship](https://github.com/gideonadeti/battleship)

## 🙏 Acknowledgments

- [The Odin Project](https://www.theodinproject.com) for the curriculum and project inspiration
- Classic Battleship game for the timeless gameplay mechanics

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

---

**Enjoy playing Battleship! May the best strategist win! 🎯**
