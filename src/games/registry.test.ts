import { describe, expect, it } from 'vitest'
import { games } from './registry'

describe('game registry', () => {
  it('keeps every game id unique and schema versioned', () => {
    expect(new Set(games.map(game => game.id)).size).toBe(games.length)
    expect(games.every(game => game.saveSchemaVersion >= 1)).toBe(true)
  })
})
