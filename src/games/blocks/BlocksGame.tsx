import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { localRepository } from '../../data/db'
import type { GameProgress } from '../../domain/game'
import { BOARD_SIZE, canPlace, emptyBoard, generateFairTray, hasAnyMove, placePiece, type Board, type Cell, type Piece } from './engine'
import './blocks.css'

interface SavedState { board: Board; tray: Piece[]; score: number; combo: number; moves: number }
const initial = (): SavedState => ({ board: emptyBoard(), tray: generateFairTray(emptyBoard()), score: 0, combo: 0, moves: 0 })

export function BlocksGame({ onBack }: { onBack: () => void }) {
  const [game, setGame] = useState<SavedState>(initial)
  const [selected, setSelected] = useState<string | null>(null)
  const [preview, setPreview] = useState<Cell | null>(null)
  const [highScore, setHighScore] = useState(0)
  const [ready, setReady] = useState(false)
  const boardRef = useRef<HTMLDivElement>(null)
  const selectedPiece = useMemo(() => game.tray.find(piece => piece.id === selected) ?? null, [game.tray, selected])
  const gameOver = game.tray.length > 0 && !hasAnyMove(game.board, game.tray)

  useEffect(() => { void localRepository.getProgress('blocks').then(saved => {
    if (saved?.state) setGame(saved.state as SavedState)
    setHighScore(saved?.highScore ?? 0); setReady(true)
  }) }, [])

  useEffect(() => {
    if (!ready) return
    const progress: GameProgress = { gameId: 'blocks', version: 1, currentLevel: 1, stars: 0, score: game.score, highScore: Math.max(highScore, game.score), stats: { moves: game.moves, maxCombo: game.combo }, state: game, updatedAt: new Date().toISOString() }
    const timer = setTimeout(() => void localRepository.saveProgress(progress), 120)
    if (game.score > highScore) setHighScore(game.score)
    return () => clearTimeout(timer)
  }, [game, highScore, ready])

  const commitPlacement = (row: number, col: number) => {
    if (!selectedPiece) return
    const result = placePiece(game.board, selectedPiece, row, col)
    if (!result) return
    const remaining = game.tray.filter(piece => piece.id !== selectedPiece.id)
    const combo = result.cleared ? game.combo + 1 : 0
    const score = game.score + result.blocks + result.cleared * 10 * Math.max(1, combo)
    setGame({ board: result.board, tray: remaining.length ? remaining : generateFairTray(result.board), score, combo, moves: game.moves + 1 })
    setSelected(null); setPreview(null)
    if (navigator.vibrate) navigator.vibrate(result.cleared ? [25, 30, 25] : 12)
  }

  useEffect(() => {
    if (!selectedPiece) return
    const move = (event: PointerEvent) => {
      const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null
      const cell = element?.closest<HTMLElement>('[data-board-cell]')
      setPreview(cell ? [Number(cell.dataset.row), Number(cell.dataset.col)] : null)
    }
    const up = () => { if (preview) commitPlacement(preview[0], preview[1]) }
    addEventListener('pointermove', move); addEventListener('pointerup', up, { once: true })
    return () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up) }
  })

  const restart = () => { setGame(initial()); setSelected(null); setPreview(null) }
  const isPreview = (row: number, col: number) => selectedPiece && preview && selectedPiece.cells.some(([dr, dc]) => preview[0] + dr === row && preview[1] + dc === col)
  const previewValid = selectedPiece && preview ? canPlace(game.board, selectedPiece, preview[0], preview[1]) : false

  return <section className="blocks-game" aria-label="Jogo Blocos">
    <header className="game-header"><button className="icon-action" onClick={onBack} aria-label="Voltar aos jogos"><ArrowLeft/></button><div><span>Blocos</span><strong>{game.score.toLocaleString('pt-BR')} pontos</strong></div><button className="icon-action" onClick={restart} aria-label="Reiniciar partida"><RotateCcw/></button></header>
    <div className="score-strip"><span><Trophy/> Recorde <strong>{Math.max(highScore, game.score).toLocaleString('pt-BR')}</strong></span><span>Combo <strong>{game.combo}×</strong></span><span>Jogadas <strong>{game.moves}</strong></span></div>
    <p className="game-help" id="blocks-help">Arraste uma peça ou toque nela e depois escolha uma casa do tabuleiro.</p>
    <div className="blocks-board" ref={boardRef} role="grid" aria-label="Tabuleiro 8 por 8" aria-describedby="blocks-help">
      {game.board.map((row, rowIndex) => row.map((value, colIndex) => <button key={`${rowIndex}-${colIndex}`} role="gridcell" data-board-cell data-row={rowIndex} data-col={colIndex} className={`block-cell color-${value} ${isPreview(rowIndex, colIndex) ? (previewValid ? 'valid-preview' : 'invalid-preview') : ''}`} aria-label={`Linha ${rowIndex + 1}, coluna ${colIndex + 1}${value ? ', ocupada' : ', vazia'}`} disabled={Boolean(value)} onClick={() => commitPlacement(rowIndex, colIndex)} />))}
    </div>
    <div className="piece-tray" aria-label="Peças disponíveis">{game.tray.map(piece => {
      const width = Math.max(...piece.cells.map(([, col]) => col)) + 1; const height = Math.max(...piece.cells.map(([row]) => row)) + 1
      return <button key={piece.id} className={`piece-button ${selected === piece.id ? 'selected' : ''}`} onClick={() => setSelected(piece.id)} onPointerDown={() => setSelected(piece.id)} aria-pressed={selected === piece.id} aria-label={`Selecionar peça com ${piece.cells.length} blocos`}>
        <span className="piece-shape" style={{ gridTemplateColumns: `repeat(${width}, 18px)`, gridTemplateRows: `repeat(${height}, 18px)` }}>{piece.cells.map(([row, col], index) => <i key={index} className={`color-${piece.color}`} style={{ gridRow: row + 1, gridColumn: col + 1 }}/>)}</span>
      </button>
    })}</div>
    {gameOver && <div className="game-over" role="dialog" aria-modal="true" aria-labelledby="game-over-title"><div><span>Partida concluída</span><h2 id="game-over-title">Boa estratégia!</h2><p>Você marcou <strong>{game.score.toLocaleString('pt-BR')}</strong> pontos em {game.moves} jogadas.</p><button className="primary" onClick={restart}>Jogar novamente</button></div></div>}
  </section>
}
