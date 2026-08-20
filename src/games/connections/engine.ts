export type Point = [number, number]
export type Paths = Record<string, Point[]>

export interface ConnectionLevel {
  id: number
  size: number
  colors: string[]
  endpoints: Record<string, [Point, Point]>
  solution: Paths
}

const palette = ['coral', 'teal', 'violet', 'gold', 'blue', 'pink']

function route(size: number, variant: 'rows' | 'cols' | 'spiral'): Point[] {
  if (variant === 'rows') return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, index) => [row, row % 2 ? size - 1 - index : index] as Point)).flat()
  if (variant === 'cols') return Array.from({ length: size }, (_, col) =>
    Array.from({ length: size }, (_, index) => [col % 2 ? size - 1 - index : index, col] as Point)).flat()
  const result: Point[] = []
  let top = 0, bottom = size - 1, left = 0, right = size - 1
  while (top <= bottom && left <= right) {
    for (let col = left; col <= right; col++) result.push([top, col]); top++
    for (let row = top; row <= bottom; row++) result.push([row, right]); right--
    if (top <= bottom) { for (let col = right; col >= left; col--) result.push([bottom, col]); bottom-- }
    if (left <= right) { for (let row = bottom; row >= top; row--) result.push([row, left]); left++ }
  }
  return result
}

function makeLevel(id: number, size: number, lengths: number[], variant: 'rows' | 'cols' | 'spiral'): ConnectionLevel {
  const cells = route(size, variant)
  if (lengths.reduce((sum, value) => sum + value, 0) !== size * size) throw new Error('A fase deve preencher o tabuleiro')
  let cursor = 0
  const solution: Paths = {}
  const endpoints: ConnectionLevel['endpoints'] = {}
  lengths.forEach((length, index) => {
    const color = palette[index]
    const path = cells.slice(cursor, cursor + length)
    solution[color] = path
    endpoints[color] = [path[0], path[path.length - 1]]
    cursor += length
  })
  return { id, size, colors: palette.slice(0, lengths.length), endpoints, solution }
}

function balancedLengths(total: number, count: number, seed: number): number[] {
  const base = Math.floor(total / count), remainder = total % count
  const result = Array(count).fill(base)
  for (let index = 0; index < remainder; index++) result[(index + seed) % count]++
  if (seed % 3 === 2 && count > 3 && result[0] > 4) { result[0]--; result[count - 1]++ }
  return result
}

export const levels: ConnectionLevel[] = Array.from({ length: 60 }, (_, index) => {
  const id = index + 1
  const size = id <= 15 ? 5 : id <= 35 ? 6 : 7
  const colors = size === 5 ? 4 : size === 6 ? 5 : 6
  const variants: ('rows' | 'cols' | 'spiral')[] = ['rows', 'cols', 'spiral']
  return makeLevel(id, size, balancedLengths(size * size, colors, id), variants[index % variants.length])
})

export const samePoint = (a: Point, b: Point) => a[0] === b[0] && a[1] === b[1]
export const adjacent = (a: Point, b: Point) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1

export function ownerAt(paths: Paths, point: Point): string | undefined {
  return Object.entries(paths).find(([, path]) => path.some(cell => samePoint(cell, point)))?.[0]
}

export function extendPath(paths: Paths, color: string, point: Point, level: ConnectionLevel): Paths | null {
  const current = paths[color] ?? []
  if (!current.length || !adjacent(current[current.length - 1], point)) return null
  const ownIndex = current.findIndex(cell => samePoint(cell, point))
  if (ownIndex >= 0) return { ...paths, [color]: current.slice(0, ownIndex + 1) }
  const owner = ownerAt(paths, point)
  if (owner && owner !== color) return null
  const foreignEndpoint = level.colors.some(other => other !== color && level.endpoints[other].some(cell => samePoint(cell, point)))
  if (foreignEndpoint) return null
  return { ...paths, [color]: [...current, point] }
}

export function isComplete(paths: Paths, level: ConnectionLevel): boolean {
  const connected = level.colors.every(color => {
    const path = paths[color] ?? []
    const [start, end] = level.endpoints[color]
    return path.length > 1 && ((samePoint(path[0], start) && samePoint(path[path.length - 1], end)) || (samePoint(path[0], end) && samePoint(path[path.length - 1], start)))
  })
  return connected && Object.values(paths).reduce((sum, path) => sum + path.length, 0) === level.size * level.size
}

export function validateLevel(level: ConnectionLevel): boolean {
  const cells = Object.values(level.solution).flat()
  const unique = new Set(cells.map(([row, col]) => `${row}:${col}`))
  return cells.length === level.size * level.size && unique.size === cells.length && Object.values(level.solution).every(path => path.slice(1).every((cell, index) => adjacent(path[index], cell))) && isComplete(level.solution, level)
}
