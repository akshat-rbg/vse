"use client";                                                                                                                                                                           
                                                                                                                                                                                          
  import { type CSSProperties, useEffect, useState } from "react";
  import Image from "next/image";
  import { useRouter } from "next/navigation";                                                                                                                                            
   
  const AMBER = "rgb(245,158,11)";                                                                                                                                                        
const SPLASH_MS = 1200;
  const TAGLINE_PRE = "Built for the ";
  const TAGLINE_EM = "ledger";                                                                                                                                                            
  const TICKER_TARGET = 8742193;                                                                                                                                                          
  const TICKER_DELAY = 1800;                                                                                                                                                              
  const TICKER_DURATION = 1100;                                                                                                                                                           
                                                                                                                                                                                          
  const PARTICLES = [
    "₹", "$", "€", "£", "¥",                                                                                                                                                              
    "INV", "TAX", "GST", "DUE", "PO",                                                                                                                                                     
    "QTY", "%", "PAID", "BAL", "n/30",                                                                                                                                                    
    "01", "02", "03", "FY25", "Q4",                                                                                                                                                       
  ];                                                                                                                                                                                      
                                                                                                                                                                                          
  function unit01(i: number, salt: number): number {                                                                                                                                      
    let h = Math.imul(i ^ salt, 0x9e3779b1);
    h ^= h >>> 16;                                                                                                                                                                        
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;                                                                                                                                                                        
    return (h >>> 0) / 4294967296;
  }                                                                                                                                                                                       
                  
  type Particle = {                                                                                                                                                                       
    label: string;
    left: string;                                                                                                                                                                         
    top: string;  
    size: string;
    delay: string;
    duration: string;
    rot: string;                                                                                                                                                                          
  };
                                                                                                                                                                                          
  const SPLASH_PARTICLES: Particle[] = Array.from({ length: 22 }, (_, i) => {                                                                                                             
    const r = unit01(i, 0x51ed);
    const r2 = unit01(i, 0xa11ce);                                                                                                                                                        
    const r3 = unit01(i, 0xbeef);
    const label = PARTICLES[i % PARTICLES.length];                                                                                                                                        
    return {      
      label,                                                                                                                                                                              
      left: `${(4 + r * 92).toFixed(3)}%`,                                                                                                                                                
      top: `${(6 + r2 * 88).toFixed(3)}%`,
      size: label.length > 1                                                                                                                                                              
        ? `${(0.55 + r3 * 0.35).toFixed(3)}rem`
        : `${(0.95 + r3 * 1.0).toFixed(3)}rem`,                                                                                                                                           
      delay: `${Math.floor(r * 2200)}ms`,                                                                                                                                                 
      duration: `${5200 + Math.floor(r2 * 2400)}ms`,                                                                                                                                      
      rot: `${-12 + Math.floor(r3 * 24)}deg`,                                                                                                                                             
    };                                                                                                                                                                                    
  });             
                                                                                                                                                                                          
  function formatINR(n: number): string {                                                                                                                                                 
    return n.toLocaleString("en-IN");
  }                                                                                                                                                                                       
                  
  type Props = {
    children: React.ReactNode;
    redirectTo?: string;                                                                                                                                                                  
  };
                                                                                                                                                                                          
  export function CurrencyLanding({ children, redirectTo }: Props) {
    const router = useRouter();
    const [showSplash, setShowSplash] = useState(true);
    const [exiting, setExiting] = useState(false);                                                                                                                                        
    const [tickerValue, setTickerValue] = useState(0);
                                                                                                                                                                                          
    useEffect(() => {
      const t1 = window.setTimeout(                                                                                                                                                       
        () => setExiting(true),
        SPLASH_MS - 700,
      );                                                                                                                                                                                  
      const t2 = window.setTimeout(() => {
        setShowSplash(false);                                                                                                                                                             
        if (redirectTo) router.replace(redirectTo);
      }, SPLASH_MS);                                                                                                                                                                      
      return () => {
        window.clearTimeout(t1);                                                                                                                                                          
        window.clearTimeout(t2);
      };                                                                                                                                                                                  
    }, [redirectTo, router]);
                                                                                                                                                                                          
    useEffect(() => {
      let raf = 0;
      let started = 0;
      const startDelay = window.setTimeout(() => {                                                                                                                                        
        const tick = (now: number) => {
          if (!started) started = now;                                                                                                                                                    
          const progress = Math.min(
            (now - started) / TICKER_DURATION,                                                                                                                                            
            1,    
          );                                                                                                                                                                              
          const eased = 1 - Math.pow(1 - progress, 3);
          setTickerValue(Math.floor(TICKER_TARGET * eased));                                                                                                                              
          if (progress < 1) raf = requestAnimationFrame(tick);
        };                                                                                                                                                                                
        raf = requestAnimationFrame(tick);
      }, TICKER_DELAY);                                                                                                                                                                   
      return () => {
        window.clearTimeout(startDelay);                                                                                                                                                  
        cancelAnimationFrame(raf);
      };                                                                                                                                                                                  
    }, []);       

    return (
      <>
        {showSplash && (
          <div
            aria-hidden                                                                                                                                                                   
            className={`splash ${exiting ? "splash-out" : ""}`}
          >                                                                                                                                                                               
            <style>{SPLASH_CSS}</style>
                                                                                                                                                                                          
            {/* Background layers */}
            <div className="splash-glow" />
            <div className="splash-grid" />                                                                                                                                               
            <div className="splash-scan" />
            <div className="splash-vignette" />                                                                                                                                           
                  
            {/* Corner registration marks */}
            <span className="reg reg-tl" />
            <span className="reg reg-tr" />                                                                                                                                               
            <span className="reg reg-bl" />
            <span className="reg reg-br" />                                                                                                                                               
                  
            {/* Corner mono labels */}                                                                                                                                                    
            <div className="meta meta-tl">VSE / Ledger</div>
            <div className="meta meta-tr">MMXXV</div>                                                                                                                                     
            <div className="meta meta-bl">v 1.0</div>
            <div className="meta meta-br">                                                                                                                                                
              <span className="dot-live" /> live                                                                                                                                          
            </div>
                                                                                                                                                                                          
            {/* Background drifting tokens */}                                                                                                                                            
            <div className="particles">
              {SPLASH_PARTICLES.map((p, i) => {                                                                                                                                           
                const style: CSSProperties = {                                                                                                                                            
                  left: p.left,
                  top: p.top,                                                                                                                                                             
                  fontSize: p.size,
                  animationDelay: p.delay,                                                                                                                                                
                  animationDuration: p.duration,
                  transform: `rotate(${p.rot})`,                                                                                                                                          
                };                                                                                                                                                                        
                return (
                  <span                                                                                                                                                                   
                    key={i}
                    className="particle"
                    style={style}                                                                                                                                                         
                  >
                    {p.label}                                                                                                                                                             
                  </span>
                );
              })}
            </div>

            {/* Hairline crosshair */}
            <div className="cross-h" />
            <div className="cross-v" />                                                                                                                                                   
   
            {/* Center stage */}                                                                                                                                                          
            <div className="stage">
              <div className="icon-wrap">
                <div className="halo halo-1" />                                                                                                                                           
                <div className="halo halo-2" />
                <div className="ring" />                                                                                                                                                  
                <div className="icon-frame">                                                                                                                                              
                  <Image
                    src="/app_icon.svg"                                                                                                                                                   
                    alt=""
                    width={48}                                                                                                                                                            
                    height={48}
                    priority                                                                                                                                                              
                  />
                </div>
              </div>

              <div className="kicker">                                                                                                                                                    
                <span className="kicker-line" />
                <span className="kicker-text">                                                                                                                                            
                  Vishwa Shree Enterprises                                                                                                                                                
                </span>
                <span className="kicker-line" />                                                                                                                                          
              </div>
                                                                                                                                                                                          
              <h1 className="tagline">
                {TAGLINE_PRE.split("").map((c, i) => (                                                                                                                                    
                  <span
                    key={`p-${i}`}                                                                                                                                                        
                    className="t-char"
                    style={{ ["--i" as string]: i } as CSSProperties}                                                                                                                     
                  >                                                                                                                                                                       
                    {c === " " ? "\u00A0" : c}
                  </span>                                                                                                                                                                 
                ))}
                <em className="tagline-em">
                  {TAGLINE_EM.split("").map((c, i) => (                                                                                                                                   
                    <span
                      key={`e-${i}`}                                                                                                                                                      
                      className="t-char"                                                                                                                                                  
                      style={{
                        ["--i" as string]: TAGLINE_PRE.length + i,                                                                                                                        
                      } as CSSProperties}                                                                                                                                                 
                    >
                      {c}                                                                                                                                                                 
                    </span>
                  ))}
                </em>
                <span
                  className="t-char"                                                                                                                                                      
                  style={{
                    ["--i" as string]:                                                                                                                                                    
                      TAGLINE_PRE.length + TAGLINE_EM.length,
                  } as CSSProperties}
                >                                                                                                                                                                         
                  .
                </span>                                                                                                                                                                   
              </h1>

              <div className="ticker">
                <span className="ticker-label">FY 25 · Q4</span>
                <span className="ticker-sep">/</span>                                                                                                                                     
                <span className="ticker-value">
                  <span className="ticker-cur">₹</span>{" "}                                                                                                                              
                  <span className="ticker-num">                                                                                                                                           
                    {formatINR(tickerValue)}
                  </span>                                                                                                                                                                 
                  <span className="ticker-decimal">.00</span>
                </span>                                                                                                                                                                   
              </div>
            </div>                                                                                                                                                                        
                  
            {/* Bottom exit cue */}
            <div className="bottom-cue">
              <span className="cue-arrow">↳</span>
              <span className="cue-text">entering vault</span>                                                                                                                            
              <span className="cue-dots">
                <i /><i /><i />                                                                                                                                                           
              </span>
            </div>                                                                                                                                                                        
          </div>  
        )}
        {children}
      </>
    );                                                                                                                                                                                    
  }
                                                                                                                                                                                          
  const SPLASH_CSS = `
    .splash {
      position: fixed;
      inset: 0;
      z-index: 100;
      overflow: hidden;
      background: #0a0a0d;                                                                                                                                                                
      color: #fff;
      transition: opacity 700ms ease-out;                                                                                                                                                 
      opacity: 1;                                                                                                                                                                         
      font-family: var(--font-sans, system-ui);
    }                                                                                                                                                                                     
    .splash-out { 
      opacity: 0;                                                                                                                                                                         
      pointer-events: none;
    }

    /* warm radial glow */
    .splash-glow {                                                                                                                                                                        
      position: absolute;
      inset: 0;                                                                                                                                                                           
      background: 
        radial-gradient(ellipse 60% 50% at 50% 50%,
          rgba(245,158,11,0.18), transparent 60%),                                                                                                                                        
        radial-gradient(ellipse 80% 40% at 50% 100%,                                                                                                                                      
          rgba(245,158,11,0.08), transparent 70%);                                                                                                                                        
      pointer-events: none;                                                                                                                                                               
      animation: glow-breathe 3s ease-in-out infinite;
    }                                                                                                                                                                                     
    @keyframes glow-breathe {
      0%, 100% { opacity: 0.85; }                                                                                                                                                         
      50% { opacity: 1; }
    }                                                                                                                                                                                     
                  
    /* hairline grid */
    .splash-grid {
      position: absolute;                                                                                                                                                                 
      inset: 0;
      background-image:                                                                                                                                                                   
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);                                                                                                             
      background-size: 56px 56px;
      pointer-events: none;                                                                                                                                                               
      opacity: 0;                                                                                                                                                                         
      animation: grid-in 800ms ease-out 200ms forwards;
    }                                                                                                                                                                                     
    @keyframes grid-in { to { opacity: 1; } }
                                                                                                                                                                                          
    /* one-shot scan line */
    .splash-scan {
      position: absolute;
      inset-inline: 0;                                                                                                                                                                    
      height: 140px;
      top: -140px;                                                                                                                                                                        
      background: linear-gradient(                                                                                                                                                        
        to bottom,
        transparent,                                                                                                                                                                      
        rgba(245,158,11,0.12),
        transparent
      );
      pointer-events: none;                                                                                                                                                               
      animation: scan 2400ms cubic-bezier(0.6, 0, 0.4, 1) 900ms 1 forwards;
      will-change: transform;                                                                                                                                                             
    }             
    @keyframes scan {                                                                                                                                                                     
      to { transform: translateY(calc(100vh + 140px)); }
    }                                                                                                                                                                                     
                                                                                                                                                                                          
    /* vignette */
    .splash-vignette {                                                                                                                                                                    
      position: absolute;
      inset: 0;
      background: radial-gradient(
        ellipse 90% 90% at 50% 50%,
        transparent 50%,                                                                                                                                                                  
        rgba(0,0,0,0.7) 100%
      );                                                                                                                                                                                  
      pointer-events: none;
    }                                                                                                                                                                                     
   
    /* registration crosshairs in corners */                                                                                                                                              
    .reg {        
      position: absolute;
      width: 22px;                                                                                                                                                                        
      height: 22px;
      pointer-events: none;                                                                                                                                                               
      opacity: 0; 
      animation: reg-in 600ms ease-out 300ms forwards;
    }                                                                                                                                                                                     
    .reg::before, .reg::after {
      content: "";                                                                                                                                                                        
      position: absolute;
      background: rgba(245,158,11,0.5);                                                                                                                                                   
    }
    .reg::before {                                                                                                                                                                        
      inset-block: 0;
      inset-inline-start: 50%;                                                                                                                                                            
      width: 1px;
    }                                                                                                                                                                                     
    .reg::after { 
      inset-inline: 0;                                                                                                                                                                    
      inset-block-start: 50%;
      height: 1px;
    }                                                                                                                                                                                     
    .reg-tl { top: 22px; left: 22px; }
    .reg-tr { top: 22px; right: 22px; }                                                                                                                                                   
    .reg-bl { bottom: 22px; left: 22px; }                                                                                                                                                 
    .reg-br { bottom: 22px; right: 22px; }
    @keyframes reg-in {                                                                                                                                                                   
      from { opacity: 0; transform: scale(0.6); }
      to { opacity: 1; transform: scale(1); }                                                                                                                                             
    }
                                                                                                                                                                                          
    /* mono corner labels */
    .meta {                                                                                                                                                                               
      position: absolute;
      font-family: var(--font-mono, monospace);                                                                                                                                           
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.25em;                                                                                                                                                             
      color: rgba(255,255,255,0.45);
      opacity: 0;                                                                                                                                                                         
      animation: meta-in 600ms ease-out 500ms forwards;
    }                                                                                                                                                                                     
    .meta-tl { top: 28px; left: 56px; }
    .meta-tr { top: 28px; right: 56px; }                                                                                                                                                  
    .meta-bl { bottom: 28px; left: 56px; }                                                                                                                                                
    .meta-br {
      bottom: 28px;                                                                                                                                                                       
      right: 56px;                                                                                                                                                                        
      display: flex;
      align-items: center;                                                                                                                                                                
      gap: 6px;   
    }
    .dot-live {
      display: inline-block;                                                                                                                                                              
      width: 6px;
      height: 6px;                                                                                                                                                                        
      border-radius: 50%;
      background: ${AMBER};
      box-shadow: 0 0 8px ${AMBER};
      animation: pulse 1.4s ease-in-out infinite;                                                                                                                                         
    }
    @keyframes meta-in {                                                                                                                                                                  
      to { opacity: 1; }                                                                                                                                                                  
    }
    @keyframes pulse {                                                                                                                                                                    
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }                                                                                                                                                              
    }
                                                                                                                                                                                          
    /* hairline crosshair drawing */
    .cross-h, .cross-v {
      position: absolute;                                                                                                                                                                 
      background: linear-gradient(
        90deg,                                                                                                                                                                            
        transparent,
        rgba(245,158,11,0.55),
        transparent                                                                                                                                                                       
      );
      pointer-events: none;                                                                                                                                                               
    }             
    .cross-h {
      inset-inline: 0;
      top: 50%;
      height: 1px;                                                                                                                                                                        
      transform: scaleX(0);
      animation: draw-h 700ms cubic-bezier(0.6,0,0.2,1) forwards;                                                                                                                         
    }                                                                                                                                                                                     
    .cross-v {
      inset-block: 0;                                                                                                                                                                     
      left: 50%;  
      width: 1px;
      background: linear-gradient(
        180deg,                                                                                                                                                                           
        transparent,
        rgba(245,158,11,0.55),                                                                                                                                                            
        transparent
      );
      transform: scaleY(0);
      animation: draw-v 700ms cubic-bezier(0.6,0,0.2,1) 150ms forwards;                                                                                                                   
    }
    @keyframes draw-h { to { transform: scaleX(1); } }                                                                                                                                    
    @keyframes draw-v { to { transform: scaleY(1); } }                                                                                                                                    
   
    /* particles */                                                                                                                                                                       
    .particles {  
      position: absolute;                                                                                                                                                                 
      inset: 0;
      pointer-events: none;                                                                                                                                                               
    }             
    .particle {
      position: absolute;
      color: rgba(245,158,11,0.35);
      font-family: var(--font-mono, monospace);                                                                                                                                           
      text-transform: uppercase;
      letter-spacing: 0.05em;                                                                                                                                                             
      user-select: none;                                                                                                                                                                  
      opacity: 0;
      animation-name: particle-float;                                                                                                                                                     
      animation-iteration-count: infinite;
      animation-timing-function: ease-in-out;                                                                                                                                             
      will-change: transform, opacity;
    }                                                                                                                                                                                     
    @keyframes particle-float {
      0% { opacity: 0; transform: translateY(20px); }                                                                                                                                     
      20%, 80% { opacity: 0.5; }
      100% { opacity: 0; transform: translateY(-20px); }                                                                                                                                  
    }             
                                                                                                                                                                                          
    /* center stage */
    .stage {                                                                                                                                                                              
      position: relative;
      z-index: 10;                                                                                                                                                                        
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;                                                                                                                                                            
      padding: 0 1.5rem;
      text-align: center;                                                                                                                                                                 
    }             

    /* icon */
    .icon-wrap {                                                                                                                                                                          
      position: relative;
      margin-bottom: 2.25rem;                                                                                                                                                             
      opacity: 0; 
      animation: icon-in 800ms cubic-bezier(0.34, 1.56, 0.64, 1)                                                                                                                          
        700ms forwards;                                                                                                                                                                   
    }                                                                                                                                                                                     
    @keyframes icon-in {                                                                                                                                                                  
      from { opacity: 0; transform: scale(0.5); }
      to { opacity: 1; transform: scale(1); }                                                                                                                                             
    }
    .icon-frame {                                                                                                                                                                         
      position: relative;
      z-index: 3;                                                                                                                                                                         
      width: 84px;
      height: 84px;                                                                                                                                                                       
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 22px;
      background: linear-gradient(                                                                                                                                                        
        180deg,
        rgba(255,255,255,0.08),                                                                                                                                                           
        rgba(255,255,255,0.02)
      );                                                                                                                                                                                  
      border: 1px solid rgba(255,255,255,0.12);
      box-shadow:                                                                                                                                                                         
        inset 0 1px 0 rgba(255,255,255,0.1),
        0 24px 48px -12px rgba(0,0,0,0.6);                                                                                                                                                
    }
    .halo {                                                                                                                                                                               
      position: absolute;
      inset: 0;                                                                                                                                                                           
      border-radius: 50%;
      pointer-events: none;
    }
    .halo-1 {                                                                                                                                                                             
      transform: scale(2.6);
      background: radial-gradient(                                                                                                                                                        
        circle, rgba(245,158,11,0.55) 0%, transparent 60%                                                                                                                                 
      );
      filter: blur(20px);                                                                                                                                                                 
      animation: halo-pulse 2.5s ease-in-out infinite;                                                                                                                                    
    }
    .halo-2 {                                                                                                                                                                             
      transform: scale(4);
      background: radial-gradient(                                                                                                                                                        
        circle, rgba(245,158,11,0.18) 0%, transparent 70%
      );                                                                                                                                                                                  
      filter: blur(40px);
      animation: halo-pulse 2.5s ease-in-out 0.5s infinite;                                                                                                                               
    }                                                                                                                                                                                     
    @keyframes halo-pulse {
      0%, 100% { opacity: 0.7; }                                                                                                                                                          
      50% { opacity: 1; }
    }
    .ring {                                                                                                                                                                               
      position: absolute;
      inset: -16px;                                                                                                                                                                       
      border-radius: 50%;
      border: 1px dashed rgba(245,158,11,0.4);
      animation: spin 14s linear infinite;                                                                                                                                                
    }
    @keyframes spin {                                                                                                                                                                     
      to { transform: rotate(360deg); }                                                                                                                                                   
    }
                                                                                                                                                                                          
    /* kicker */  
    .kicker {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;                                                                                                                                                             
      opacity: 0;
      animation: meta-in 500ms ease-out 1300ms forwards;                                                                                                                                  
    }                                                                                                                                                                                     
    .kicker-line {
      display: block;                                                                                                                                                                     
      width: 28px;
      height: 1px;
      background: rgba(245,158,11,0.5);
    }                                                                                                                                                                                     
    .kicker-text {
      font-family: var(--font-mono, monospace);                                                                                                                                           
      font-size: 10px;
      text-transform: uppercase;                                                                                                                                                          
      letter-spacing: 0.3em;
      color: rgba(245,158,11,0.85);                                                                                                                                                       
    }             
                                                                                                                                                                                          
    /* tagline */
    .tagline {                                                                                                                                                                            
      font-family: var(--font-display, serif);
      font-weight: 400;
      font-size: clamp(1.75rem, 6vw, 2.5rem);                                                                                                                                             
      line-height: 1.1;
      letter-spacing: -0.01em;                                                                                                                                                            
      color: #fff;                                                                                                                                                                        
      margin: 0 0 1.75rem;
      max-width: 24ch;                                                                                                                                                                    
    }                                                                                                                                                                                     
    .tagline-em {
      color: ${AMBER};                                                                                                                                                                    
      font-style: italic;
      font-weight: 400;
    }                                                                                                                                                                                     
    .t-char {
      display: inline-block;                                                                                                                                                              
      opacity: 0; 
      transform: translateY(10px);
      animation: char-in 600ms cubic-bezier(0.2, 0.8, 0.3, 1) forwards;                                                                                                                   
      animation-delay: calc(1500ms + var(--i) * 35ms);                                                                                                                                    
    }                                                                                                                                                                                     
    @keyframes char-in {                                                                                                                                                                  
      to { opacity: 1; transform: translateY(0); }                                                                                                                                        
    }             

    /* ticker */
    .ticker {                                                                                                                                                                             
      display: inline-flex;
      align-items: baseline;                                                                                                                                                              
      gap: 0.65rem;
      padding: 0.6rem 1.1rem;                                                                                                                                                             
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.02);                                                                                                                                                 
      border-radius: 4px;
      font-family: var(--font-mono, monospace);                                                                                                                                           
      opacity: 0; 
      animation: meta-in 600ms ease-out 1700ms forwards;                                                                                                                                  
    }
    .ticker-label {                                                                                                                                                                       
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.2em;                                                                                                                                                              
      color: rgba(255,255,255,0.4);
    }                                                                                                                                                                                     
    .ticker-sep { 
      color: rgba(255,255,255,0.2);
      font-size: 12px;                                                                                                                                                                    
    }
    .ticker-value {                                                                                                                                                                       
      font-size: 14px;
      color: ${AMBER};
      font-variant-numeric: tabular-nums;                                                                                                                                                 
      letter-spacing: 0.02em;
    }                                                                                                                                                                                     
    .ticker-cur { 
      color: rgba(245,158,11,0.6);                                                                                                                                                        
      margin-right: 2px;
    }                                                                                                                                                                                     
    .ticker-decimal {
      color: rgba(245,158,11,0.4);                                                                                                                                                        
    }
                                                                                                                                                                                          
    /* bottom cue */
    .bottom-cue {
      position: absolute;
      bottom: 64px;                                                                                                                                                                       
      left: 50%;
      transform: translateX(-50%);                                                                                                                                                        
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--font-mono, monospace);                                                                                                                                           
      font-size: 10px;
      text-transform: uppercase;                                                                                                                                                          
      letter-spacing: 0.25em;
      color: rgba(255,255,255,0.5);
      opacity: 0;                                                                                                                                                                         
      animation: meta-in 500ms ease-out 2400ms forwards;
    }                                                                                                                                                                                     
    .cue-arrow {  
      color: ${AMBER};                                                                                                                                                                    
      font-size: 14px;
    }                                                                                                                                                                                     
    .cue-dots {   
      display: inline-flex;
      gap: 3px;
      margin-left: 4px;                                                                                                                                                                   
    }
    .cue-dots i {                                                                                                                                                                         
      display: block;
      width: 3px;                                                                                                                                                                         
      height: 3px;
      border-radius: 50%;                                                                                                                                                                 
      background: ${AMBER};
      animation: dot-bounce 1s ease-in-out infinite;
    }                                                                                                                                                                                     
    .cue-dots i:nth-child(2) { animation-delay: 0.15s; }
    .cue-dots i:nth-child(3) { animation-delay: 0.3s; }                                                                                                                                   
    @keyframes dot-bounce {                                                                                                                                                               
      0%, 100% { opacity: 0.3; transform: translateY(0); }
      50% { opacity: 1; transform: translateY(-3px); }                                                                                                                                    
    }             
                                                                                                                                                                                          
    @media (max-width: 480px) {
      .meta-tl, .meta-tr { display: none; }                                                                                                                                               
      .reg-tl, .reg-tr { top: 16px; }
      .reg-bl, .reg-br { bottom: 16px; }                                                                                                                                                  
      .reg-tl, .reg-bl { left: 16px; }
      .reg-tr, .reg-br { right: 16px; }                                                                                                                                                   
      .meta-bl { left: 32px; bottom: 22px; }
      .meta-br { right: 32px; bottom: 22px; }                                                                                                                                             
      .bottom-cue { bottom: 52px; }
    }                                                                                                                                                                                     
  `; 