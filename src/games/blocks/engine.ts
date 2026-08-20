export const BOARD_SIZE = 8
export type Board = number[][]
export type Cell = readonly [number, number]

export interface Piece {
  id: string
  cells: Cell[]
  color: number
}

const SHAPES: Cell[][] = [
  [[0, 0]], [[0, 0], [0, 1]], [[0, 0], [1, 0]],
  [[0, 0], [0, 1], [0, 2]], [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  [[0, 0], [1, 0], [1, 1]], [[0, 1], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [1, 0], [2, 0], [2, 1]], [[0, 1], [1, 1], [2, 0], [2, 1]],
  [[0, 0], [0, 1], [1, 1], [1, 2]], [[0, 1], [1, 0], [1, 1], [2, 0]],
  [[0, 0], [0, 1], [0, 2], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]]
]

export const emptyBoard = (): Board => Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0))
export const cloneBoard = (board: Board): Board => board.map(row => [...row])

export function canPlace(board: Board, piece: Piece, row: number, col: number) {
  return piece.cells.every(([dr, dc]) => row + dr < BOARD_SIZE && col + dc < BOARD_SIZE && row + dr >= 0 && col + dc >= 0 && board[row + dr][col + dc] === 0)
}

export function placements(board: Board, piece: Piece) {
  const result: Cell[] = []
  for (let row = 0; row < BOARD_SIZE; row++) for (let col = 0; col < BOARD_SIZE; col++) if (canPlace(board, piece, row, col)) result.push([row, col])
  return result
}

export function placePiece(board: Board, piece: Piece, row: number, col: number) {
  if (!canPlace(board, piece, row, col)) return null
  const next = cloneBoard(board)
  piece.cells.forEach(([dr, dc]) => { next[row + dr][col + dc] = piece.color })
  const fullRows = next.map((cells, index) => cells.every(Boolean) ? index : -1).filter(index => index >= 0)
  const fullCols = Array.from({ length: BOARD_SIZE }, (_, colIndex) => next.every(cells => cells[colIndex]) ? colIndex : -1).filter(index => index >= 0)
  fullRows.forEach(rowIndex => { next[rowIndex] = Array(BOARD_SIZE).fill(0) })
  fullCols.forEach(colIndex => next.forEach(cells => { cells[colIndex] = 0 }))
  return { board: next, cleared: fullRows.length + fullCols.length, blocks: piece.cells.length }
}

function makePiece(index: number, random: () => number): Piece {
  return { id: `${Date.now()}-${index}-${Math.floor(random() * 1e9)}`, cells: SHAPES[Math.floor(random() * SHAPES.length)], color: 1 + Math.floor(random() * 5) }
}

function trayHasSequence(board: Board, tray: Piece[], depth = 0): boolean {
  if (depth === tray.length) return true
  const piece = tray[depth]
  return placements(board, piece).some(([row, col]) => {
    const result = placePiece(board, piece, row, col)
    return result ? trayHasSequence(result.board, tray, depth + 1) : false
  })
}

export function generateFairTray(board: Board, random = Math.random): Piece[] {
  for (let attempt = 0; attempt < 80; attempt++) {
    const tray = [0, 1, 2].map(index => makePiece(index, random))
    if (trayHasSequence(board, tray)) return tray
  }
  return [0, 1, 2].map(index => ({ id: `fallback-${Date.now()}-${index}`, cells: [[0, 0]] as Cell[], color: index + 1 }))
}

export function hasAnyMove(board: Board, tray: Piece[]) {
  return tray.some(piece => placements(board, piece).length > 0)
}
