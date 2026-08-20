export type Columns = number[][]
export const COLUMN_COUNT = 5, COLUMN_HEIGHT = 8
export const emptyColumns = (): Columns => Array.from({ length: COLUMN_COUNT }, () => [])
export interface DropResult { columns: Columns; gained: number; combo: number }
export function dropTile(columns: Columns, column: number, value: number): DropResult | null {
  if (column < 0 || column >= COLUMN_COUNT || columns[column].length >= COLUMN_HEIGHT) return null
  const next = columns.map(stack => [...stack]); const stack = next[column]; stack.push(value)
  let gained = 0, combo = 0
  while (stack.length > 1 && stack.at(-1) === stack.at(-2)) { const merged = stack.pop()! * 2; stack.pop(); stack.push(merged); gained += merged; combo++ }
  return { columns: next, gained, combo }
}
export function nextTile(maximum: number, random = Math.random): number {
  const ceiling = Math.max(2, Math.min(64, maximum / 8 || 2)); const options = [2, 2, 2, 4, 4, 8].filter(value => value <= ceiling)
  return options[Math.floor(random() * options.length)]
}
export const columnsFull = (columns: Columns) => columns.every(stack => stack.length >= COLUMN_HEIGHT)
export const largestTile = (columns: Columns) => Math.max(0, ...columns.flat())
