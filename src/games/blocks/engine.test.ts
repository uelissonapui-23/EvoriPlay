import { describe, expect, it } from 'vitest'
import { emptyBoard, generateFairTray, placePiece, placements } from './engine'

describe('blocks engine', () => {
  it('generates a tray whose pieces can be placed', () => {
    const board = emptyBoard()
    const tray = generateFairTray(board, () => 0.42)
    expect(tray).toHaveLength(3)
    expect(tray.every(piece => placements(board, piece).length > 0)).toBe(true)
  })

  it('clears a completed row', () => {
    const board = emptyBoard()
    board[0] = [1, 1, 1, 1, 1, 1, 1, 0]
    const result = placePiece(board, { id: 'one', cells: [[0, 0]], color: 2 }, 0, 7)
    expect(result?.cleared).toBe(1)
    expect(result?.board[0].every(cell => cell === 0)).toBe(true)
  })
})
