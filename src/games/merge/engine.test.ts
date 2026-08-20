import { describe, expect, it } from 'vitest'
import { addRandomTile, moveBoard } from './engine'

describe('merge engine', () => {
  it('merges each tile only once per move', () => {
    const result = moveBoard([[2, 2, 2, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], 'left')
    expect(result.board[0]).toEqual([4, 4, 0, 0]); expect(result.score).toBe(8)
  })
  it('adds a 2 in a predictable empty cell with injected randomness', () => {
    expect(addRandomTile([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], () => 0)[0][0]).toBe(2)
  })
})
