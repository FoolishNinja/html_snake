// Defining variables to store canvas and canvas 2d context
let canvas = null;
let ctx = null;

let side = 400;
let tiles = 15;
let tileSide = null;

let snake = null;
let createNewTile = false;

let direction = 0;
let canChangeDirection = 1;

let spawnFood = true;
let food = { x: -1, y: -1 };
let borderOn = true;

let score = 2000;
let gameSpeed = 5;

let gameInterval = null;
let gameIsOver = false;
let gameHasStarted = false;

const BLACK = "#000000",
  WHITE = "#FFFFFF",
  RED = "#FF0000",
  GREEN = "#00FF00";

window.onload = () => setup();

const setup = () => {
  loadSettings();
};

const startGame = () => {
  keyListeners();
  spawnNewFood();
  loop();
};

const loop = () => {
  gameInterval = setInterval(tick, gameSpeed * 10);
};

const tick = () => {
  checkHeadFoodCollision();
  checkSnakeBorderCollision();
  updateSnake();
  drawBackground();
  drawFood();
  drawBody();
  drawScore();
  checkSnakeSelfCollision();
  checkForGameWin();
};

const gameOver = () => {
  if (gameIsOver) return;
  clearInterval(gameInterval);
  gameIsOver = true;
  setTimeout(() => {
    drawBackground();
    drawScore();
    drawGameOverText();
  }, 200);
  setTimeout(() => window.location.reload(), 2000);
};

const gameWin = () => {
  if (gameIsOver) return;
  clearInterval(gameInterval);
  gameIsOver = true;
  setTimeout(() => {
    drawBackground();
    drawScore();
    drawGameWinText();
  }, 200);
  setTimeout(() => window.location.reload(), 2000);
};

/**
 * Settings
 */
const loadSettings = () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  drawBackground();
  drawSnakeText();

  const tileInput = document.getElementById("tile-input");
  tileInput.value = tiles;
  const gameSpeedInput = document.getElementById("game-speed-input");
  gameSpeedInput.value = gameSpeed;

  const borderOnInput = document.getElementById("border-on");
  borderOnInput.addEventListener("click", () => {
    borderOn = !borderOn;
    borderOnInput.value = borderOn ? 1 : 0;
    borderOnInput.innerText = `Turn borders ${borderOn ? "off" : "on"}`;
  });

  const startButton = document.getElementById("start-game");
  startButton.addEventListener("click", () => {
    if (gameHasStarted) return;
    gameHasStarted = true;
    applySettings();
    startGame();
  });
};

const applySettings = () => {
  const tileInput = document.getElementById("tile-input");
  const t =
    parseInt(tileInput.value) % 2 === 0
      ? parseInt(tileInput.value) + 1
      : parseInt(tileInput.value);
  tileSide = side / t;
  tiles = t;
  tileInput.value = t;

  const gameSpeedInput = document.getElementById("game-speed-input");
  gameSpeed = 15 - parseInt(gameSpeedInput.value);
  snake = [{ x: Math.floor(tiles / 2), y: Math.floor(tiles / 2) }];
  snake.push({ x: snake[0].x - 1, y: snake[0].y });
};

const keyListeners = () => {
  const keyMap = {
    KeyW: 0,
    KeyA: 3,
    KeyS: 2,
    KeyD: 1,
  };
  const oppositeMap = {
    KeyW: 2,
    KeyA: 1,
    KeyS: 0,
    KeyD: 3,
  };
  document.addEventListener("keydown", (e) => {
    if (
      !canChangeDirection ||
      keyMap[e.code] === undefined ||
      oppositeMap[e.code] === direction
    )
      return;
    direction = keyMap[e.code];
    canChangeDirection = false;
  });
};

/**
 * Drawing
 */
const drawBackground = () => {
  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, side, side);
};

const drawBody = () => {
  ctx.fillStyle = WHITE;
  snake.forEach((tile) => {
    ctx.fillRect(
      tile.x * tileSide + 2,
      tile.y * tileSide + 2,
      tileSide - 4,
      tileSide - 4
    );
  });
};

const drawFood = () => {
  ctx.fillStyle = RED;
  ctx.fillRect(
    food.x * tileSide + 2,
    food.y * tileSide + 2,
    tileSide - 4,
    tileSide - 4
  );
};

const drawScore = () => {
  ctx.font = "15px Trebuchet MS";
  ctx.fillStyle = WHITE;
  ctx.fillText(`Score: ${score}`, 5, 15);
};

const drawGameOverText = () => {
  ctx.font = "40px Trebuchet MS";
  ctx.fillStyle = WHITE;
  ctx.fillText("Game Over!", 90, side / 2 + 20);
};

const drawGameWinText = () => {
  ctx.font = "40px Trebuchet MS";
  ctx.fillStyle = WHITE;
  ctx.fillText("You've won!", 90, side / 2 + 20);
};

const drawSnakeText = () => {
  ctx.font = "40px Trebuchet MS";
  ctx.fillStyle = WHITE;
  ctx.fillText("Snake", 148, side / 2 + 20);
};

/**
 * Altering snake and food
 */
const updateSnake = () => {
  const directionXMap = {
    0: 0,
    1: 1,
    2: 0,
    3: -1,
  };
  const directionYMap = {
    0: -1,
    1: 0,
    2: 1,
    3: 0,
  };
  let nextHeadPosition = {
    x: snake[0].x + directionXMap[direction],
    y: snake[0].y + directionYMap[direction],
  };
  if (!borderOn) {
    if (nextHeadPosition.x < 0) nextHeadPosition.x = tiles - 1;
    if (nextHeadPosition.x > tiles - 1) nextHeadPosition.x = 0;
    if (nextHeadPosition.y < 0) nextHeadPosition.y = tiles - 1;
    if (nextHeadPosition.y > tiles - 1) nextHeadPosition.y = 0;
  }

  if (createNewTile) {
    snake.splice(0, 0, nextHeadPosition);
    createNewTile = false;
    return;
  }

  for (let i = snake.length - 1; i > 0; i--)
    snake[i] = { x: snake[i - 1].x, y: snake[i - 1].y };
  snake[0] = nextHeadPosition;
  canChangeDirection = true;
};

const spawnNewFood = () => {
  let x = getRandomInt(0, tiles);
  let y = getRandomInt(0, tiles);
  while (snake.filter((tile) => tile.x === x && tile.y === y).length > 0) {
    x = getRandomInt(0, tiles);
    y = getRandomInt(0, tiles);
  }
  food = { x, y };
};

/**
 * Collision checking
 */
const checkHeadFoodCollision = () => {
  if (snake[0].x === food.x && snake[0].y === food.y) {
    spawnFood = true;
    score += 1000;
    incrementSnakeLength();
    spawnNewFood();
  }
};

const checkSnakeSelfCollision = () => {
  snake.forEach((tile, index) => {
    snake.forEach((tile2, index2) => {
      if (index === index2) return;
      if (tile.x === tile2.x && tile.y === tile2.y) gameOver();
    });
  });
};

const checkSnakeBorderCollision = () => {
  if (!borderOn) return;
  const x = snake[0].x;
  const y = snake[0].y;

  if (x < 0 || x > tiles - 1 || y < 0 || y > tiles - 1) gameOver();
};

const checkForGameWin = () => {
  if (snake.length === tiles * tiles) {
    gameWin();
  }
};

const incrementSnakeLength = () => {
  createNewTile = true;
};

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};
