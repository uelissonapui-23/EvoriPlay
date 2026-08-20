import { expect, it } from 'vitest'
import { isSolved, moveTile, shuffleBoard, solved } from './engine'
it('moves only a tile beside the empty space', () => { expect(moveTile(solved(), 14)?.[15]).toBe(15); expect(moveTile(solved(), 0)).toBeNull() })
it('always creates a reachable shuffled board', () => { expect(shuffleBoard(20, () => .2)).toHaveLength(16); expect(isSolved(shuffleBoard(0))).toBe(true) })
