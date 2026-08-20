import type { GameProgress } from '../domain/game'
import type { Player, Settings } from '../domain/player'

const DB_NAME = 'evoriplay'
const DB_VERSION = 1

type StoreName = 'player' | 'gameProgress' | 'achievements' | 'settings' | 'syncQueue' | 'appMeta'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      const stores: StoreName[] = ['player', 'gameProgress', 'achievements', 'settings', 'syncQueue', 'appMeta']
      stores.forEach((store) => {
        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store)
      })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function read<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = db.transaction(store, 'readonly').objectStore(store).get(key)
    request.onsuccess = () => resolve(request.result as T | undefined)
    request.onerror = () => reject(request.error)
  })
}

async function write<T>(store: StoreName, key: IDBValidKey, value: T): Promise<void> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readwrite')
    transaction.objectStore(store).put(value, key)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

const now = () => new Date().toISOString()

export const localRepository = {
  async getPlayer(): Promise<Player> {
    const saved = await read<Player>('player', 'local')
    if (saved) return saved
    const created: Player = { id: crypto.randomUUID(), nickname: 'Explorador', level: 1, xp: 0, coins: 0, createdAt: now(), updatedAt: now() }
    await write('player', 'local', created)
    return created
  },
  savePlayer: (player: Player) => write('player', 'local', { ...player, updatedAt: now() }),
  getProgress: (gameId: string) => read<GameProgress>('gameProgress', gameId),
  saveProgress: (progress: GameProgress) => write('gameProgress', progress.gameId, { ...progress, updatedAt: now() }),
  async getSettings(): Promise<Settings> {
    return (await read<Settings>('settings', 'main')) ?? { sound: true, vibration: true, reducedMotion: false, language: 'pt-BR' }
  },
  saveSettings: (settings: Settings) => write('settings', 'main', settings)
}
