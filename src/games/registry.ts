import type { GameDefinition } from '../domain/game'

export const games: GameDefinition[] = [
  { id: 'blocks', name: 'Blocos', description: 'Encaixe peças, complete linhas e construa combos.', category: 'estratégia', version: 1, icon: '◆', accent: '#ff7a59', supportsLevels: false, supportsScore: true, saveSchemaVersion: 1, status: 'planned' },
  { id: 'connections', name: 'Conexões', description: 'Una as cores e preencha todo o tabuleiro.', category: 'lógica', version: 1, icon: '⌁', accent: '#18a999', supportsLevels: true, supportsScore: false, saveSchemaVersion: 1, status: 'planned' },
  { id: 'merge', name: 'Merge', description: 'Combine números e alcance novos valores.', category: 'estratégia', version: 1, icon: '＋', accent: '#6c5ce7', supportsLevels: false, supportsScore: true, saveSchemaVersion: 1, status: 'planned' },
  { id: 'memory', name: 'Memória', description: 'Encontre pares com precisão e poucos movimentos.', category: 'memória', version: 1, icon: '✦', accent: '#ec4c8a', supportsLevels: true, supportsScore: false, saveSchemaVersion: 1, status: 'planned' },
  { id: 'slider', name: 'Deslizante', description: 'Organize as peças e supere seu melhor tempo.', category: 'lógica', version: 1, icon: '▦', accent: '#3578e5', supportsLevels: true, supportsScore: false, saveSchemaVersion: 1, status: 'planned' }
]
