import { expect, it } from 'vitest'
import { createDeck, symbols } from './engine'
it('creates exactly two cards for every symbol', () => { const deck = createDeck(() => .5); expect(deck).toHaveLength(16); symbols.forEach(symbol => expect(deck.filter(card => card.symbol === symbol)).toHaveLength(2)) })
