export type SliderBoard = number[]
export const solved = (): SliderBoard => [...Array.from({ length: 15 }, (_, i) => i + 1), 0]
export const movable = (board: SliderBoard, index: number) => { const empty = board.indexOf(0); return Math.abs(Math.floor(empty / 4) - Math.floor(index / 4)) + Math.abs(empty % 4 - index % 4) === 1 }
export function moveTile(board: SliderBoard, index: number): SliderBoard | null { if (!movable(board, index)) return null; const next = [...board], empty = next.indexOf(0); [next[index], next[empty]] = [next[empty], next[index]]; return next }
export function shuffleBoard(steps = 160, random = Math.random): SliderBoard { let board = solved(), previous = -1; for (let step = 0; step < steps; step++) { const options = board.map((_, i) => i).filter(i => movable(board, i) && i !== previous); const index = options[Math.floor(random() * options.length)]; previous = board.indexOf(0); board = moveTile(board, index)! } return board }
export const isSolved = (board: SliderBoard) => board.every((value, index) => value === (index + 1) % 16)
