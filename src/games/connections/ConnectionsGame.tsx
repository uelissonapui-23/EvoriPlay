import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, RotateCcw, Star } from 'lucide-react'
import { localRepository } from '../../data/db'
import type { GameProgress } from '../../domain/game'
import { adjacent, extendPath, isComplete, levels, ownerAt, samePoint, type Paths, type Point } from './engine'
import './connections.css'

interface SavedState { levelIndex: number; paths: Paths; errors: number; resets: number; bestStars: number[] }
const initialState = (): SavedState => ({ levelIndex: 0, paths: {}, errors: 0, resets: 0, bestStars: [] })

export function ConnectionsGame({ onBack }: { onBack: () => void }) {
  const [game, setGame] = useState<SavedState>(initialState)
  const [active, setActive] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const activeRef = useRef<string | null>(null)
  const drawingRef = useRef(false)
  const level = levels[Math.min(game.levelIndex, levels.length - 1)]
  const complete = isComplete(game.paths, level)
  const stars = game.errors === 0 && game.resets === 0 ? 3 : game.errors <= 3 ? 2 : 1

  useEffect(() => { void localRepository.getProgress('connections').then(saved => {
    if (saved?.state) setGame(saved.state as SavedState)
    setReady(true)
  }) }, [])

  useEffect(() => {
    if (!ready) return
    const progress: GameProgress = { gameId: 'connections', version: 1, currentLevel: level.id, stars: game.bestStars.reduce((sum, value) => sum + value, 0), score: 0, highScore: 0, stats: { errors: game.errors, completedLevels: game.bestStars.filter(Boolean).length }, state: game, updatedAt: new Date().toISOString() }
    const timer = setTimeout(() => void localRepository.saveProgress(progress), 120)
    return () => clearTimeout(timer)
  }, [game, level.id, ready])

  const begin = (color: string, point: Point) => {
    const endpoints = level.endpoints[color]
    const existing = game.paths[color] ?? []
    let path: Point[]
    if (endpoints.some(cell => samePoint(cell, point))) path = [point]
    else {
      const index = existing.findIndex(cell => samePoint(cell, point))
      if (index < 0) return
      path = existing.slice(0, index + 1)
    }
    activeRef.current = color; setActive(color); setGame(current => ({ ...current, paths: { ...current.paths, [color]: path } }))
  }

  const visit = (point: Point) => {
    const color = activeRef.current
    if (!color) return
    setGame(current => {
      const next = extendPath(current.paths, color, point, level)
      return next ? { ...current, paths: next } : current
    })
  }

  const handleCell = (point: Point) => {
    const owner = ownerAt(game.paths, point)
    const endpointColor = level.colors.find(color => level.endpoints[color].some(cell => samePoint(cell, point)))
    if (!active) {
      const color = endpointColor ?? owner
      if (color) begin(color, point)
      return
    }
    const next = extendPath(game.paths, active, point, level)
    if (next) setGame(current => ({ ...current, paths: next }))
    else if (endpointColor || owner) begin(endpointColor ?? owner!, point)
    else setGame(current => ({ ...current, errors: current.errors + 1 }))
  }

  const stopDrawing = () => { drawingRef.current = false }
  const reset = () => { drawingRef.current = false; activeRef.current = null; setActive(null); setGame(current => ({ ...current, paths: {}, errors: 0, resets: current.resets + 1 })) }
  const nextLevel = () => setGame(current => {
    const bestStars = [...current.bestStars]
    bestStars[current.levelIndex] = Math.max(bestStars[current.levelIndex] ?? 0, stars)
    return { levelIndex: Math.min(current.levelIndex + 1, levels.length - 1), paths: {}, errors: 0, resets: 0, bestStars }
  })

  const occupied = useMemo(() => new Map(Object.entries(game.paths).flatMap(([color, path]) => path.map(([row, col]) => [`${row}:${col}`, color]))), [game.paths])

  return <section className="connections-game" aria-label="Jogo Conexões" onPointerUp={stopDrawing} onPointerCancel={stopDrawing}>
    <header className="game-header"><button className="icon-action" onClick={onBack} aria-label="Voltar aos jogos"><ArrowLeft/></button><div><span>Conexões</span><strong>Fase {level.id} de {levels.length}</strong></div><button className="icon-action" onClick={reset} aria-label="Reiniciar fase"><RotateCcw/></button></header>
    <div className="connection-progress" aria-label={`Progresso: fase ${level.id} de ${levels.length}`}><i style={{ width: `${(level.id / levels.length) * 100}%` }}/></div>
    <div className="connection-intro"><p className="eyebrow">Ligue os pares</p><h1>Preencha cada espaço.</h1><p id="connections-help">Arraste entre pontos da mesma cor. Você também pode tocar no ponto inicial e depois em cada casa.</p></div>
    <div className="connections-board" style={{ gridTemplateColumns: `repeat(${level.size}, 1fr)` }} role="grid" aria-label={`Tabuleiro ${level.size} por ${level.size}`} aria-describedby="connections-help" onPointerMove={event => {
      if (!activeRef.current || !drawingRef.current) return
      const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null
      const cell = element?.closest<HTMLElement>('[data-connection-cell]')
      if (cell) visit([Number(cell.dataset.row), Number(cell.dataset.col)])
    }}>
      {Array.from({ length: level.size * level.size }, (_, index) => {
        const point: Point = [Math.floor(index / level.size), index % level.size]
        const endpoint = level.colors.find(color => level.endpoints[color].some(cell => samePoint(cell, point)))
        const color = occupied.get(`${point[0]}:${point[1]}`) ?? endpoint
        return <button key={index} role="gridcell" data-connection-cell data-row={point[0]} data-col={point[1]} className={`connection-cell ${color ? `connection-${color}` : ''} ${endpoint ? 'endpoint' : ''}`} aria-label={`Linha ${point[0] + 1}, coluna ${point[1] + 1}${endpoint ? `, ponto ${endpoint}` : color ? `, caminho ${color}` : ', vazia'}`} onPointerDown={event => { event.preventDefault(); const startColor = endpoint ?? ownerAt(game.paths, point); if (startColor) { drawingRef.current = true; const last = game.paths[startColor]?.at(-1); if (!(activeRef.current === startColor && last && adjacent(last, point))) begin(startColor, point) } }} onClick={() => handleCell(point)}><span/></button>
      })}
    </div>
    <div className="connection-legend"><span>{Object.values(game.paths).reduce((sum, path) => sum + path.length, 0)}/{level.size * level.size} casas</span><span>{game.errors} tentativas inválidas</span></div>
    {complete && <div className="game-over" role="dialog" aria-modal="true" aria-labelledby="connections-complete"><div><span>Fase concluída</span><h2 id="connections-complete">Tudo conectado!</h2><div className="earned-stars" aria-label={`${stars} estrelas`}>{[1, 2, 3].map(value => <Star key={value} fill={value <= stars ? 'currentColor' : 'none'}/>)}</div><p>Você preencheu todo o tabuleiro sem cruzar os caminhos.</p><button className="primary" onClick={nextLevel}>{level.id === levels.length ? 'Jogar novamente' : 'Próxima fase'}</button></div></div>}
  </section>
}
