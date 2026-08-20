export interface Player {
  id: string
  nickname: string
  level: number
  xp: number
  coins: number
  createdAt: string
  updatedAt: string
}

export interface Settings {
  sound: boolean
  vibration: boolean
  reducedMotion: boolean
  language: 'pt-BR'
}
