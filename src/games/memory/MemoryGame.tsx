import { useEffect, useState } from 'react'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { localRepository } from '../../data/db'
import type { GameProgress } from '../../domain/game'
import { createDeck, type MemoryCard } from './engine'
import './memory.css'

interface State { cards: MemoryCard[]; open: number[]; moves: number; lock: boolean }
const fresh = (): State => ({ cards: createDeck(), open: [], moves: 0, lock: false })
export function MemoryGame({ onBack }: { onBack: () => void }) {
  const [game, setGame] = useState<State>(fresh), [best, setBest] = useState(0), [ready, setReady] = useState(false)
  const complete = game.cards.every(card => card.matched)
  useEffect(() => { void localRepository.getProgress('memory').then(saved => { if (saved?.state) setGame(saved.state as State); setBest(Number(saved?.stats.bestMoves ?? 0)); setReady(true) }) }, [])
  useEffect(() => { if (!ready) return; const nextBest = complete && (!best || game.moves < best) ? game.moves : best; if (nextBest !== best) setBest(nextBest); const timer = setTimeout(() => void localRepository.saveProgress({ gameId:'memory',version:1,currentLevel:1,stars:complete ? (game.moves <= 12 ? 3 : game.moves <= 18 ? 2 : 1) : 0,score:0,highScore:0,stats:{moves:game.moves,bestMoves:nextBest},state:game,updatedAt:new Date().toISOString() }),120); return () => clearTimeout(timer) }, [game,best,complete,ready])
  const flip = (index: number) => { if (game.lock || game.cards[index].matched || game.open.includes(index)) return; const open = [...game.open,index]; if (open.length < 2) { setGame({...game,open}); return } const match = game.cards[open[0]].symbol === game.cards[open[1]].symbol; setGame({...game,open,moves:game.moves+1,lock:true}); setTimeout(() => setGame(current => ({...current,cards:match ? current.cards.map((card,i) => open.includes(i) ? {...card,matched:true}:card):current.cards,open:[],lock:false})),550) }
  return <section className="memory-game" aria-label="Jogo Memória"><header className="game-header"><button className="icon-action" onClick={onBack} aria-label="Voltar aos jogos"><ArrowLeft/></button><div><span>Memória</span><strong>{game.moves} jogadas</strong></div><button className="icon-action" onClick={() => setGame(fresh())} aria-label="Reiniciar"><RotateCcw/></button></header><div className="memory-copy"><p className="eyebrow">Encontre os pares</p><h1>Observe. Lembre. Combine.</h1><p>Sem cronômetro: jogue no seu ritmo usando toque, clique ou teclado.</p><span><Trophy/> Melhor resultado: <strong>{best || '—'}</strong></span></div><div className="memory-board" role="grid" aria-label="Cartas da memória">{game.cards.map((card,index) => { const visible=card.matched||game.open.includes(index); return <button role="gridcell" key={card.id} className={`memory-card ${visible?'visible':''} ${card.matched?'matched':''}`} onClick={() => flip(index)} disabled={card.matched} aria-label={visible?`Carta ${card.symbol}${card.matched?', par encontrado':''}`:'Carta virada'}><span>{visible?card.symbol:'?'}</span></button> })}</div>{complete&&<div className="game-over" role="dialog" aria-modal="true"><div><span>Todos os pares encontrados</span><h2>Memória brilhante!</h2><p>Você concluiu em <strong>{game.moves} jogadas</strong>.</p><button className="primary" onClick={() => setGame(fresh())}>Jogar novamente</button></div></div>}</section>
}
