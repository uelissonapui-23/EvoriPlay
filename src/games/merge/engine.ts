export const MERGE_SIZE = 4
export type MergeBoard = number[][]
export type Direction = 'up' | 'down' | 'left' | 'right'

export const emptyMergeBoard = (): MergeBoard => Array.from({ length: MERGE_SIZE }, () => Array(MERGE_SIZE).fill(0))
export const boardsEqual = (a: MergeBoard, b: MergeBoard) => a.every((row, r) => row.every((value, c) => value === b[r][c]))

export function addRandomTile(board: MergeBoard, random = Math.random): MergeBoard {
  const empty = board.flatMap((row, r) => row.map((value, c) => value ? null : [r, c] as const)).filter(Boolean) as (readonly [number, number])[]
  if (!empty.length) return board.map(row => [...row])
  const [row, col] = empty[Math.floor(random() * empty.length)]
  const next = board.map(line => [...line])
  next[row][col] = random() < .9 ? 2 : 4
  return next
}

export function initialMergeBoard(random = Math.random): MergeBoard {
  return addRandomTile(addRandomTile(emptyMergeBoard(), random), random)
}

function collapse(line: number[]): { line: number[]; score: number } {
  const values = line.filter(Boolean)
  const merged: number[] = []
  let score = 0
  for (let index = 0; index < values.length; index++) {
    if (values[index] === values[index + 1]) { const value = values[index] * 2; merged.push(value); score += value; index++ }
    else merged.push(values[index])
  }
  return { line: [...merged, ...Array(MERGE_SIZE - merged.length).fill(0)], score }
}

export function moveBoard(board: MergeBoard, direction: Direction): { board: MergeBoard; score: number; changed: boolean } {
  const next = emptyMergeBoard(); let score = 0
  for (let index = 0; index < MERGE_SIZE; index++) {
    const source = direction === 'left' || direction === 'right' ? [...board[index]] : board.map(row => row[index])
    if (direction === 'right' || direction === 'down') source.reverse()
    const result = collapse(source); score += result.score
    if (direction === 'right' || direction === 'down') result.line.reverse()
    result.line.forEach((value, cross) => { if (direction === 'left' || direction === 'right') next[index][cross] = value; else next[cross][index] = value })
  }
  return { board: next, score, changed: !boardsEqual(board, next) }
}

export const canMove = (board: MergeBoard) => board.some(row => row.includes(0)) || board.some((row, r) => row.some((value, c) => (r + 1 < MERGE_SIZE && board[r + 1][c] === value) || (c + 1 < MERGE_SIZE && row[c + 1] === value)))
export const maxTile = (board: MergeBoard) => Math.max(...board.flat())
