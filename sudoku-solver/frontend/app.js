let cells = [];
let gridSize = 9;  // default 9x9

// Generate the grid dynamically
function generateGrid() {
  const gridContainer = document.getElementById("sudoku-grid");
  gridContainer.innerHTML = "";

  resetTimer(); // reset stopwatch on new grid

  gridSize = parseInt(document.getElementById("grid-size").value);
  cells = [];

  gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 40px)`;
  gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 40px)`;

  for (let row = 0; row < gridSize; row++) {
    cells[row] = [];
    for (let col = 0; col < gridSize; col++) {
      let input = document.createElement("input");
      input.type = "number";
      input.min = 1;
      input.max = gridSize;
      input.value = "";
      gridContainer.appendChild(input);
      cells[row][col] = input;
    }
  }

  attachValidation(); // validation + timer start/stop
}


// Collect grid values
function getGridValues() {
  let grid = [];
  for (let row = 0; row < gridSize; row++) {
    grid[row] = [];
    for (let col = 0; col < gridSize; col++) {
      let value = parseInt(cells[row][col].value);
      grid[row][col] = isNaN(value) ? 0 : value;
    }
  }
  return grid;
}

// Fill grid with solved values
function setGridValues(solution) {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      cells[row][col].value = solution[row][col];
    }
  }
}

// Send request to backend
async function solveSudoku() {
  const grid = getGridValues();

  try {
    const response = await fetch("http://127.0.0.1:5000/solve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grid, size: gridSize }),
    });

    const data = await response.json();
    if (response.ok) {
      setGridValues(data.solution);
    } else {
      alert(data.error || "Error solving Sudoku");
    }
  } catch (err) {
    alert("Backend not reachable. Is Flask running?");
    console.error(err);
  }
}

// Clear the grid
function clearGrid() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      cells[row][col].value = "";
    }
  }
}

// Load new puzzle from backend
async function newPuzzle() {
  try {
    const response = await fetch(`http://127.0.0.1:5000/generate?size=${gridSize}`);
    const data = await response.json();
    const puzzle = data.puzzle;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        cells[row][col].value = puzzle[row][col] === 0 ? "" : puzzle[row][col];
      }
    }
  } catch (err) {
    alert("Could not generate puzzle. Is backend running?");
    console.error(err);
  }
}

// Check if value is valid as per Sudoku rules
function isValidInput(row, col, value) {
  if (!value) return true;

  // Row check
  for (let c = 0; c < gridSize; c++) {
    if (c !== col && cells[row][c].value == value) return false;
  }

  // Column check
  for (let r = 0; r < gridSize; r++) {
    if (r !== row && cells[r][col].value == value) return false;
  }

  // Subgrid check
  const n = Math.sqrt(gridSize);
  const startRow = Math.floor(row / n) * n;
  const startCol = Math.floor(col / n) * n;

  for (let r = startRow; r < startRow + n; r++) {
    for (let c = startCol; c < startCol + n; c++) {
      if ((r !== row || c !== col) && cells[r][c].value == value) {
        return false;
      }
    }
  }
  return true;
}

// Add event listeners to validate while typing
function attachValidation() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      cells[row][col].addEventListener("input", () => {
        let value = cells[row][col].value;
        if (isValidInput(row, col, value)) {
          cells[row][col].style.background = "white";
        } else {
          cells[row][col].style.background = "#ffcccc"; // red highlight
        }
      });
    }
  }
}

// Call it every time grid is generated
function generateGrid() {
  const gridContainer = document.getElementById("sudoku-grid");
  gridContainer.innerHTML = "";

  gridSize = parseInt(document.getElementById("grid-size").value);
  cells = [];

  gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 40px)`;
  gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 40px)`;

  for (let row = 0; row < gridSize; row++) {
    cells[row] = [];
    for (let col = 0; col < gridSize; col++) {
      let input = document.createElement("input");
      input.type = "number";
      input.min = 1;
      input.max = gridSize;
      input.value = "";
      gridContainer.appendChild(input);
      cells[row][col] = input;
    }
  }

  attachValidation(); // <--- add validation after generating grid
}

let timerInterval;
let startTime;
let timerRunning = false;

// Start live timer
function startTimer() {
  clearInterval(timerInterval);
  startTime = Date.now();
  timerRunning = true;

  timerInterval = setInterval(() => {
    let elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    document.getElementById("timer").textContent = `⏱ ${elapsed}s`;
  }, 100);
}

// Stop timer
function stopTimer(finalText = null) {
  clearInterval(timerInterval);
  timerRunning = false;
  if (finalText) {
    document.getElementById("timer").textContent = finalText;
  }
}

// Check if Sudoku is fully solved & valid
function checkSolved() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      let value = cells[row][col].value;
      if (!value || !isValidInput(row, col, value)) {
        return false; // not solved or invalid
      }
    }
  }
  return true;
}

// Attach validation + timer start + solved detection
function attachValidation() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      cells[row][col].addEventListener("input", () => {
        let value = cells[row][col].value;

        // Start timer on first input
        if (!timerRunning && value) {
          startTimer();
        }

        // Validate
        if (isValidInput(row, col, value)) {
          cells[row][col].style.background = "white";
        } else {
          cells[row][col].style.background = "#ffcccc";
        }

        // Check if solved
        if (checkSolved()) {
          let duration = ((Date.now() - startTime) / 1000).toFixed(2);
          stopTimer(`🎉 Solved in ${duration}s`);
        }
      });
    }
  }
}

// Reset timer when generating/clearing puzzle
function resetTimer() {
  stopTimer("⏱ 0.0s");
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function visualizeSolve() {
  const grid = getGridValues();
  await solveSudokuVisual(grid);
}

async function solveSudokuVisual(board) {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= gridSize; num++) {
          if (isValidInput(row, col, num)) {
            board[row][col] = num;
            cells[row][col].value = num;
            await sleep(50); // visualization speed

            if (await solveSudokuVisual(board)) return true;

            // backtrack
            board[row][col] = 0;
            cells[row][col].value = "";
            await sleep(30);
          }
        }
        return false;
      }
    }
  }
  return true;
}

async function solveSudoku() {
  const grid = getGridValues();
  startTimer(); // ⏱ start stopwatch when solving begins

  try {
    const response = await fetch("http://127.0.0.1:5000/solve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grid, size: gridSize }),
    });

    const data = await response.json();
    if (response.ok) {
      setGridValues(data.solution);

      let duration = ((Date.now() - startTime) / 1000).toFixed(2);
      stopTimer(`⏱ Solved in ${duration}s`);
    } else {
      alert(data.error || "Error solving Sudoku");
      stopTimer("❌ Failed");
    }
  } catch (err) {
    alert("Backend not reachable. Is Flask running?");
    stopTimer("⚠️ Error");
    console.error(err);
  }
}

function getSpeed() {
  return parseInt(document.getElementById("speed").value);
}

async function solveSudokuVisual(board) {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= gridSize; num++) {
          if (isValidInput(row, col, num)) {
            board[row][col] = num;
            cells[row][col].value = num;
            await sleep(getSpeed()); // 🕐 controlled by slider

            if (await solveSudokuVisual(board)) return true;

            // backtrack
            board[row][col] = 0;
            cells[row][col].value = "";
            await sleep(getSpeed());
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Generate default 9x9 on load
window.onload = generateGrid;
