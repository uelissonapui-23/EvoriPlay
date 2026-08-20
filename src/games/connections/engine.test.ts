import { describe, expect, it } from 'vitest'
import { extendPath, levels, validateLevel } from './engine'

describe('connection levels', () => {
  it('ships only contiguous, full-board solutions', () => {
    expect(levels.every(validateLevel)).toBe(true)
  })
  it('rejects crossing another color', () => {
    const level = levels[0]
    const first = level.colors[0], second = level.colors[1]
    const paths = { [first]: level.solution[first].slice(0, 2), [second]: level.solution[second].slice(0, 1) }
    expect(extendPath(paths, first, paths[second][0], level)).toBeNull()
  })
})
