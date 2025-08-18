import random, math

def is_valid(board, row, col, num, size):
    # same as before ...
    if num in board[row]:
        return False
    for i in range(size):
        if board[i][col] == num:
            return False
    n = int(math.sqrt(size))
    start_row, start_col = n * (row // n), n * (col // n)
    for i in range(n):
        for j in range(n):
            if board[start_row + i][start_col + j] == num:
                return False
    return True

def solve_sudoku(board, size):
    for row in range(size):
        for col in range(size):
            if board[row][col] == 0:
                for num in range(1, size+1):
                    if is_valid(board, row, col, num, size):
                        board[row][col] = num
                        if solve_sudoku(board, size):
                            return True
                        board[row][col] = 0
                return False
    return True

def generate_puzzle(size=9, clues=30):
    """Generate a Sudoku puzzle with given grid size and number of clues"""
    board = [[0 for _ in range(size)] for _ in range(size)]
    solve_sudoku(board, size)  # fill completely

    # remove cells to create puzzle
    cells_to_remove = size*size - clues
    while cells_to_remove > 0:
        row, col = random.randint(0, size-1), random.randint(0, size-1)
        if board[row][col] != 0:
            board[row][col] = 0
            cells_to_remove -= 1
    return board
