import type { GameDefinition } from '../domain/game'

export const games: GameDefinition[] = [
  { id: 'blocks', name: 'Blocos', description: 'Encaixe peças, complete linhas e construa combos.', category: 'estratégia', version: 1, icon: '◆', accent: '#ff7a59', supportsLevels: false, supportsScore: true, saveSchemaVersion: 1, status: 'available' },
  { id: 'connections', name: 'Conexões', description: 'Una as cores e preencha todo o tabuleiro.', category: 'lógica', version: 1, icon: '⌁', accent: '#18a999', supportsLevels: true, supportsScore: false, saveSchemaVersion: 1, status: 'available' },
  { id: 'merge', name: 'Merge', description: 'Combine números e alcance novos valores.', category: 'estratégia', version: 1, icon: '＋', accent: '#6c5ce7', supportsLevels: false, supportsScore: true, saveSchemaVersion: 1, status: 'available' },
  { id: 'memory', name: 'Memória', description: 'Encontre pares com precisão e poucos movimentos.', category: 'memória', version: 1, icon: '✦', accent: '#ec4c8a', supportsLevels: true, supportsScore: false, saveSchemaVersion: 1, status: 'available' },
  { id: 'slider', name: 'Deslizante', description: 'Organize as peças e supere seu melhor resultado.', category: 'lógica', version: 1, icon: '▦', accent: '#3578e5', supportsLevels: true, supportsScore: false, saveSchemaVersion: 1, status: 'available' },
  { id: 'columns', name: 'Colunas', description: 'Solte números, provoque fusões e construa sequências.', category: 'estratégia', version: 1, icon: '⇣', accent: '#9c2bb2', supportsLevels: false, supportsScore: true, saveSchemaVersion: 1, status: 'available' }
]
