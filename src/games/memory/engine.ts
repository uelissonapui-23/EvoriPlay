export interface MemoryCard { id: string; symbol: string; matched: boolean }
export const symbols = ['◆', '●', '▲', '★', '☀', '☂', '♣', '♥']
export function createDeck(random = Math.random): MemoryCard[] {
  const deck = symbols.flatMap((symbol, pair) => [0, 1].map(copy => ({ id: `${pair}-${copy}`, symbol, matched: false })))
  for (let index = deck.length - 1; index > 0; index--) { const other = Math.floor(random() * (index + 1)); [deck[index], deck[other]] = [deck[other], deck[index]] }
  return deck
}
