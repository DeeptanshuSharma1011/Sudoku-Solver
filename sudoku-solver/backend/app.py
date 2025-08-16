from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)  # enable CORS for all routes


# ------------------ Sudoku Solver ------------------ #
def find_empty(board, size):
    """Find the next empty cell (0 = empty)."""
    for r in range(size):
        for c in range(size):
            if board[r][c] == 0:
                return r, c
    return None


def valid(board, num, pos, size):
    """Check if num can be placed at pos = (row, col)."""
    row, col = pos

    # Row check
    if num in board[row]:
        return False

    # Column check
    if num in [board[r][col] for r in range(size)]:
        return False

    # Subgrid check
    box_size = int(size ** 0.5)
    box_x = col // box_size
    box_y = row // box_size

    for i in range(box_y * box_size, box_y * box_size + box_size):
        for j in range(box_x * box_size, box_x * box_size + box_size):
            if board[i][j] == num:
                return False

    return True


def solve_sudoku(board, size):
    """Solve Sudoku using backtracking with randomized number order."""
    empty = find_empty(board, size)
    if not empty:
        return True
    row, col = empty

    # 🔀 Randomize numbers to explore different solving paths
    nums = list(range(1, size + 1))
    random.shuffle(nums)

    for num in nums:
        if valid(board, num, (row, col), size):
            board[row][col] = num

            if solve_sudoku(board, size):
                return True

            board[row][col] = 0

    return False


# ------------------ Puzzle Generator ------------------ #
def generate_puzzle(size, clues):
    """Generate a simple Sudoku puzzle with given number of clues."""
    # Start with an empty board
    board = [[0] * size for _ in range(size)]
    solve_sudoku(board, size)  # fill completely with a valid solution

    # Remove numbers to create puzzle
    cells_to_remove = size * size - clues
    while cells_to_remove > 0:
        r = random.randint(0, size - 1)
        c = random.randint(0, size - 1)
        if board[r][c] != 0:
            board[r][c] = 0
            cells_to_remove -= 1
    return board


# ------------------ API Routes ------------------ #
@app.route("/solve", methods=["POST"])
def solve():
    data = request.json
    grid = data.get("grid")
    size = data.get("size", 9)

    if not grid or len(grid) != size or any(len(row) != size for row in grid):
        return jsonify({"error": f"Invalid Sudoku grid. Expected {size}x{size}"}), 400

    solved = solve_sudoku(grid, size)
    if solved:
        return jsonify({"solution": grid})
    else:
        return jsonify({"error": "No solution exists"}), 400


@app.route("/generate", methods=["GET"])
def generate():
    size = int(request.args.get("size", 9))
    clues = int(request.args.get("clues", size * size // 2))  # default ~50% filled
    puzzle = generate_puzzle(size, clues)
    return jsonify({"puzzle": puzzle})


if __name__ == "__main__":
    app.run(debug=True)
