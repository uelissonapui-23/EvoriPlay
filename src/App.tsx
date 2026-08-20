import { useEffect, useState } from 'react'
import { Gamepad2, Home, Library, Settings as SettingsIcon, UserRound, WifiOff } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { localRepository } from './data/db'
import type { Player, Settings } from './domain/player'
import { games } from './games/registry'
import { BlocksGame } from './games/blocks/BlocksGame'

type Page = 'home' | 'games' | 'profile' | 'settings' | 'blocks'

export function App() {
  const [page, setPage] = useState<Page>('home')
  const [online, setOnline] = useState(navigator.onLine)
  const [player, setPlayer] = useState<Player | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW()

  useEffect(() => {
    void Promise.all([localRepository.getPlayer(), localRepository.getSettings()]).then(([p, s]) => { setPlayer(p); setSettings(s) })
    const update = () => setOnline(navigator.onLine)
    addEventListener('online', update); addEventListener('offline', update)
    return () => { removeEventListener('online', update); removeEventListener('offline', update) }
  }, [])

  const toggle = async (key: 'sound' | 'vibration' | 'reducedMotion') => {
    if (!settings) return
    const next = { ...settings, [key]: !settings[key] }
    setSettings(next); await localRepository.saveSettings(next)
  }

  if (page === 'blocks') return <BlocksGame onBack={() => setPage('games')} />

  return <div className="app-shell">
    <a className="skip-link" href="#content">Pular para o conteúdo</a>
    <header className="topbar">
      <button className="brand" onClick={() => setPage('home')} aria-label="Ir para o início"><span>E</span> EvoriPlay</button>
      <div className={`network ${online ? '' : 'offline'}`}>{online ? 'Pronto para jogar offline' : <><WifiOff size={16}/> Você está offline</>}</div>
      <div className="player-chip"><span>Nível {player?.level ?? 1}</span><strong>{player?.coins ?? 0} ✦</strong></div>
    </header>
    {needRefresh && <section className="update-banner" role="status"><span>Uma atualização está pronta.</span><button onClick={() => updateServiceWorker(true)}>Atualizar agora</button><button className="quiet" aria-label="Fechar aviso" onClick={() => setNeedRefresh(false)}>Depois</button></section>}
    <main id="content">
      {page === 'home' && <HomePage nickname={player?.nickname ?? 'Explorador'} onExplore={() => setPage('games')} onPlayBlocks={() => setPage('blocks')} />}
      {page === 'games' && <GamesPage onPlayBlocks={() => setPage('blocks')} />}
      {page === 'profile' && <ProfilePage player={player} />}
      {page === 'settings' && settings && <SettingsPage settings={settings} toggle={toggle} />}
    </main>
    <nav className="bottom-nav" aria-label="Navegação principal">
      <NavButton active={page === 'home'} icon={<Home/>} label="Início" onClick={() => setPage('home')} />
      <NavButton active={page === 'games'} icon={<Library/>} label="Jogos" onClick={() => setPage('games')} />
      <NavButton active={page === 'profile'} icon={<UserRound/>} label="Progresso" onClick={() => setPage('profile')} />
      <NavButton active={page === 'settings'} icon={<SettingsIcon/>} label="Ajustes" onClick={() => setPage('settings')} />
    </nav>
  </div>
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button className={active ? 'active' : ''} aria-current={active ? 'page' : undefined} onClick={onClick}>{icon}<span>{label}</span></button>
}

function HomePage({ nickname, onExplore, onPlayBlocks }: { nickname: string; onExplore: () => void; onPlayBlocks: () => void }) {
  return <><section className="hero"><div><p className="eyebrow">Seu momento de jogar</p><h1>Olá, {nickname}.</h1><p>Escolha um desafio rápido, avance no seu ritmo e continue de onde parou, mesmo sem internet.</p><button className="primary" onClick={onPlayBlocks}><Gamepad2/> Jogar Blocos</button></div><div className="orbital-art" aria-hidden="true"><i/><i/><i/><b>✦</b></div></section><section className="section"><div className="section-title"><div><p className="eyebrow">Pacote inicial</p><h2>Cinco jeitos de desafiar a mente</h2></div><button className="text-button" onClick={onExplore}>Ver todos</button></div><GameGrid compact onPlayBlocks={onPlayBlocks} /></section></>
}

function GamesPage({ onPlayBlocks }: { onPlayBlocks: () => void }) { return <section className="section page-head"><p className="eyebrow">Biblioteca</p><h1>Escolha seu próximo desafio</h1><p>Comece por Blocos. Os próximos jogos serão adicionados em atualizações frequentes.</p><GameGrid onPlayBlocks={onPlayBlocks} /></section> }

function GameGrid({ compact = false, onPlayBlocks }: { compact?: boolean; onPlayBlocks: () => void }) { return <div className="game-grid">{games.slice(0, compact ? 3 : games.length).map(game => <article className="game-card" key={game.id} style={{'--accent': game.accent} as React.CSSProperties}><div className="game-icon">{game.icon}</div><div><span>{game.category}</span><h3>{game.name}</h3><p>{game.description}</p></div>{game.status === 'available' ? <><button className="play-game" onClick={onPlayBlocks}>Jogar agora</button><small id={`status-${game.id}`}>Disponível offline</small></> : <><button disabled aria-describedby={`status-${game.id}`}>Em construção</button><small id={`status-${game.id}`}>Disponível nas próximas etapas</small></>}</article>)}</div> }

function ProfilePage({ player }: { player: Player | null }) { return <section className="section page-head"><p className="eyebrow">Sua jornada</p><h1>{player?.nickname ?? 'Explorador'}</h1><div className="stats"><article><strong>{player?.level ?? 1}</strong><span>Nível geral</span></article><article><strong>{player?.xp ?? 0}</strong><span>XP acumulado</span></article><article><strong>{player?.coins ?? 0}</strong><span>Estrelas</span></article></div><div className="empty-state"><span>◎</span><h2>Sua aventura começa aqui</h2><p>Recordes, conquistas e jogos recentes aparecerão depois da primeira partida.</p></div></section> }

function SettingsPage({ settings, toggle }: { settings: Settings; toggle: (key: 'sound' | 'vibration' | 'reducedMotion') => void }) { return <section className="section page-head settings"><p className="eyebrow">Preferências</p><h1>Jogue do seu jeito</h1><Setting label="Efeitos sonoros" detail="Sons curtos durante os jogos" value={settings.sound} onChange={() => toggle('sound')} /><Setting label="Vibração" detail="Feedback tátil em aparelhos compatíveis" value={settings.vibration} onChange={() => toggle('vibration')} /><Setting label="Reduzir movimento" detail="Limita animações não essenciais" value={settings.reducedMotion} onChange={() => toggle('reducedMotion')} /></section> }

function Setting({ label, detail, value, onChange }: { label: string; detail: string; value: boolean; onChange: () => void }) { return <label className="setting"><span><strong>{label}</strong><small>{detail}</small></span><input type="checkbox" checked={value} onChange={onChange}/></label> }
