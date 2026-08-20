export type GameId = 'blocks' | 'connections' | 'merge' | 'memory' | 'slider'

export interface GameProgress {
  gameId: GameId
  version: number
  currentLevel: number
  stars: number
  score: number
  highScore: number
  stats: Record<string, number>
  updatedAt: string
}

export interface GameDefinition {
  id: GameId
  name: string
  description: string
  category: 'estratégia' | 'lógica' | 'memória'
  version: number
  icon: string
  accent: string
  supportsLevels: boolean
  supportsScore: boolean
  saveSchemaVersion: number
  status: 'available' | 'planned'
}
