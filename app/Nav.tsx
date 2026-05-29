'use client'

import { useState, useEffect } from 'react'

const GOLD = '#C9A84C'
const GOLD2 = '#F0D080'
const MUTED = 'rgba(255,255,255,0.38)'

const navCss = `
  @keyframes shimmerPulse {
    0%,100% { opacity:0.4; transform:scaleX(0.8); }
    50%     { opacity:1;   transform:scaleX(1); }
  }
  @keyframes lightSweep {
    0%   { transform:translateX(-120%) skewX(-20deg); opacity:0; }
    10%  { opacity:1; }
    90%  { opacity:1; }
    100% { transform:translateX(220%) skewX(-20deg); opacity:0; }
  }
  .dsf-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 500;
    height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px;
    transition: all 0.5s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .dsf-nav.scrolled {
    background: rgba(4,4,10,0.7);
    backdrop-filter: blur(40px) saturate(200%);
    -webkit-backdrop-filter: blur(40px) saturate(200%);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    box-shadow: 0 1px 0 rgba(201,168,76,0.06), 0 8px 32px rgba(0,0,0,0.4);
  }
  .nav-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px; font-weight: 600; letter-spacing: 10px;
    color: ${GOLD2};
    position: relative;
    text-shadow: 0 0 40px rgba(201,168,76,0.4);
    text-decoration: none;
  }
  .nav-logo::after {
    content: '';
    position: absolute; bottom: -4px; left: 0; right: 0; height: 1px;
    background: linear-gradient(to right, ${GOLD}, transparent);
    animation: shimmerPulse 3s ease infinite;
  }
  .nav-pill {
  display: flex; align-items: center; gap: 4px;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 100px; padding: 6px 8px;
  position: absolute; left: 50%; transform: translateX(-50%);
}
  .nav-item {
    padding: 7px 18px; border-radius: 100px;
    font-size: 11px; letter-spacing: 2px; font-weight: 500;
    text-decoration: none; color: ${MUTED};
    transition: all 0.3s cubic-bezier(0.25,0.46,0.45,0.94);
    position: relative; overflow: hidden;
    font-family: 'Outfit', sans-serif;
  }
  .nav-item::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    transform: translateX(-100%);
    transition: none;
  }
  .nav-item:hover::before { animation: lightSweep 0.7s ease forwards; }
  .nav-item.active {
    background: rgba(201,168,76,0.15);
    border: 1px solid rgba(201,168,76,0.3);
    color: ${GOLD2};
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px rgba(201,168,76,0.1);
  }
  .nav-item:hover:not(.active) {
    color: rgba(255,255,255,0.8);
    background: rgba(255,255,255,0.06);
  }
`

const LINKS = [
  { href: '/',         label: 'FILMY' },
  { href: '/rebricek', label: 'REBRÍČEK' },
  { href: '/reziseri', label: 'REŽISÉRI' },
]

export default function Nav({ count }: { count?: number }) {
  const [scrolled, setScrolled] = useState(false)
  const [path, setPath] = useState('')

  useEffect(() => {
    setPath(window.location.pathname)
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <style>{navCss}</style>
      <nav className={`dsf-nav${scrolled ? ' scrolled' : ''}`}>
        <a href="/" className="nav-logo">DSF</a>
        <div className="nav-pill">
          {LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className={`nav-item${path === l.href ? ' active' : ''}`}
            >
              {l.label}
            </a>
          ))}
        </div>
        {count != null && (
          <div style={{ fontSize: 11, color: MUTED, letterSpacing: 1, fontFamily: 'Outfit, sans-serif' }}>
            {count} SK filmov
          </div>
        )}
      </nav>
    </>
  )
}
