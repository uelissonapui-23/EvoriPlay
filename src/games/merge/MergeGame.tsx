import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CornerUpLeft, RotateCcw, Trophy } from 'lucide-react'
import { localRepository } from '../../data/db'
import type { GameProgress } from '../../domain/game'
import { addRandomTile, canMove, initialMergeBoard, maxTile, moveBoard, type Direction, type MergeBoard } from './engine'
import './merge.css'

interface Snapshot { board: MergeBoard; score: number; moves: number }
interface SavedState extends Snapshot { previous: Snapshot | null; won: boolean }
const fresh = (): SavedState => ({ board: initialMergeBoard(), score: 0, moves: 0, previous: null, won: false })

export function MergeGame({ onBack }: { onBack: () => void }) {
  const [game, setGame] = useState<SavedState>(fresh)
  const [highScore, setHighScore] = useState(0)
  const [ready, setReady] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const touch = useRef<[number, number] | null>(null)
  const over = !canMove(game.board)

  useEffect(() => { void localRepository.getProgress('merge').then(saved => {
    if (saved?.state) setGame(saved.state as SavedState)
    setHighScore(saved?.highScore ?? 0); setReady(true)
  }) }, [])

  useEffect(() => {
    if (!ready) return
    const progress: GameProgress = { gameId: 'merge', version: 1, currentLevel: 1, stars: maxTile(game.board) >= 2048 ? 3 : maxTile(game.board) >= 512 ? 2 : 0, score: game.score, highScore: Math.max(highScore, game.score), stats: { moves: game.moves, maxTile: maxTile(game.board) }, state: game, updatedAt: new Date().toISOString() }
    const timer = setTimeout(() => void localRepository.saveProgress(progress), 120)
    if (game.score > highScore) setHighScore(game.score)
    return () => clearTimeout(timer)
  }, [game, highScore, ready])

  const move = (direction: Direction) => setGame(current => {
    const result = moveBoard(current.board, direction)
    if (!result.changed) return current
    const score = current.score + result.score
    const board = addRandomTile(result.board)
    if (navigator.vibrate) navigator.vibrate(result.score ? 18 : 8)
    return { board, score, moves: current.moves + 1, previous: { board: current.board, score: current.score, moves: current.moves }, won: current.won || maxTile(board) >= 2048 }
  })

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const directions: Record<string, Direction> = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' }
      const direction = directions[event.key]
      if (direction) { event.preventDefault(); move(direction) }
    }
    addEventListener('keydown', key); return () => removeEventListener('keydown', key)
  }, [])

  const undo = () => setGame(current => current.previous ? { ...current.previous, previous: null, won: maxTile(current.previous.board) >= 2048 } : current)
  const restart = () => { if (game.moves && !confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3000); return } setGame(fresh()); setConfirmReset(false) }
  const endSwipe = (x: number, y: number) => {
    if (!touch.current) return
    const dx = x - touch.current[0], dy = y - touch.current[1]; touch.current = null
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'))
  }

  return <section className="merge-game" aria-label="Jogo Merge">
    <header className="game-header"><button className="icon-action" onClick={onBack} aria-label="Voltar aos jogos"><ArrowLeft/></button><div><span>Merge</span><strong>{game.score.toLocaleString('pt-BR')} pontos</strong></div><button className={`icon-action ${confirmReset ? 'confirming' : ''}`} onClick={restart} aria-label={confirmReset ? 'Confirmar nova partida' : 'Iniciar nova partida'}><RotateCcw/></button></header>
    <div className="merge-summary"><span><Trophy/> Recorde <strong>{Math.max(highScore, game.score).toLocaleString('pt-BR')}</strong></span><span>Maior peça <strong>{maxTile(game.board)}</strong></span><button onClick={undo} disabled={!game.previous}><CornerUpLeft/> Desfazer</button></div>
    {confirmReset && <p className="reset-warning" role="status">Toque novamente para confirmar a nova partida.</p>}
    <div className="merge-copy"><p className="eyebrow">Some iguais</p><h1>Construa o 2048.</h1><p id="merge-help">Deslize o tabuleiro, use as setas/WASD ou os controles abaixo.</p></div>
    <div className="merge-board" role="grid" aria-label="Tabuleiro Merge 4 por 4" aria-describedby="merge-help" tabIndex={0} onPointerDown={event => { touch.current = [event.clientX, event.clientY] }} onPointerUp={event => endSwipe(event.clientX, event.clientY)}>
      {game.board.flatMap((row, r) => row.map((value, c) => <div role="gridcell" className={`merge-cell tile-${value || 'empty'}`} aria-label={`Linha ${r + 1}, coluna ${c + 1}${value ? `, peça ${value}` : ', vazia'}`} key={`${r}-${c}`}><span>{value || ''}</span></div>))}
    </div>
    <div className="merge-controls" aria-label="Controles de movimento"><button onClick={() => move('up')} aria-label="Mover para cima"><ArrowUp/></button><button onClick={() => move('left')} aria-label="Mover para esquerda"><ArrowLeft/></button><button onClick={() => move('down')} aria-label="Mover para baixo"><ArrowDown/></button><button onClick={() => move('right')} aria-label="Mover para direita"><ArrowRight/></button></div>
    <p className="spawn-note">A cada movimento nasce uma peça: 90% de chance de 2 e 10% de 4.</p>
    {over && <div className="game-over" role="dialog" aria-modal="true" aria-labelledby="merge-over"><div><span>Tabuleiro completo</span><h2 id="merge-over">Boa combinação!</h2><p>Maior peça: <strong>{maxTile(game.board)}</strong> · Pontuação: <strong>{game.score.toLocaleString('pt-BR')}</strong></p><button className="primary" onClick={() => setGame(fresh())}>Jogar novamente</button></div></div>}
  </section>
}
