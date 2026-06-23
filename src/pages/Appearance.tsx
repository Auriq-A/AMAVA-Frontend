import React from 'react';
import { useApp } from '../context/AppContext';
const card: React.CSSProperties = { background:'var(--surface-card)', border:'1px solid var(--border-subtle)', borderRadius:16, backdropFilter:'blur(12px)', padding:24 };
const PRESETS = ['#00D4FF','#4B9DFF','#2BD9A0','#9B8CFF','#FF6B6B','#F5A623'];
const DENSITIES = [{v:'comfortable',label:'Comfortable',gap:'20px'},{v:'compact',label:'Compact',gap:'14px'},{v:'dense',label:'Dense',gap:'8px'}];

export default function Appearance() {
  const { theme, accent, density, setTheme, setAccent, setDensity } = useApp();

  const optCard = (active:boolean): React.CSSProperties => ({
    display:'flex',flexDirection:'column',padding:16,borderRadius:14,cursor:'pointer',
    border:'2px solid '+(active?accent:'var(--border-subtle)'),
    background:active?accent+'18':'var(--surface-inset)',
    color:'var(--text-primary)',transition:'var(--transition-all)',
    fontFamily:'var(--font-body)',textAlign:'left',
  });

  return (
    <div style={{maxWidth:780,margin:'0 auto',display:'flex',flexDirection:'column',gap:'var(--gap)'}}>
      <div><h2 style={{margin:'0 0 4px',fontFamily:'var(--font-display)',fontSize:20,fontWeight:700,color:'var(--text-primary)'}}>Appearance</h2><p style={{margin:0,fontSize:13,color:'var(--text-muted)'}}>Customize theme, accent color, and layout density. All changes apply instantly and persist.</p></div>

      {/* Theme */}
      <div style={card}>
        <div style={{fontSize:11,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-muted)',fontWeight:600,marginBottom:14}}>Theme</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {[{v:'dark',label:'Dark'},{v:'light',label:'Light'}].map(t=>(
            <button key={t.v} onClick={()=>setTheme(t.v as any)} style={optCard(theme===t.v)}>
              <div style={{height:72,borderRadius:9,background:t.v==='dark'?'linear-gradient(135deg,#04121F,#0A1F35)':'linear-gradient(135deg,#EEF2F7,#DDE4EF)',marginBottom:13,padding:11,display:'flex',flexDirection:'column',gap:5,overflow:'hidden'}}>
                <div style={{height:8,borderRadius:3,background:t.v==='dark'?'rgba(255,255,255,.18)':'rgba(0,0,0,.18)',width:'55%'}}/>
                <div style={{height:5,borderRadius:3,background:t.v==='dark'?'rgba(255,255,255,.08)':'rgba(0,0,0,.1)',width:'75%'}}/>
                <div style={{height:5,borderRadius:3,background:t.v==='dark'?'rgba(255,255,255,.08)':'rgba(0,0,0,.1)',width:'40%'}}/>
                <div style={{height:18,borderRadius:5,marginTop:3,background:accent,opacity:.85,width:'45%'}}/>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13.5,fontWeight:600,color:theme===t.v?accent:'var(--text-primary)'}}>{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Accent color */}
      <div style={card}>
        <div style={{fontSize:11,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-muted)',fontWeight:600,marginBottom:14}}>Accent color</div>
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          {PRESETS.map(hex=>(
            <button key={hex} onClick={()=>setAccent(hex)} title={hex} style={{width:36,height:36,borderRadius:'50%',background:hex,border:'3px solid '+(accent===hex?'var(--text-primary)':'transparent'),outline:accent===hex?'2px solid '+hex:'none',outlineOffset:2,cursor:'pointer',transition:'var(--transition-all)',padding:0}}/>
          ))}
          <div style={{position:'relative',display:'flex',alignItems:'center',gap:8,height:40,padding:'0 14px',borderRadius:10,background:'var(--surface-inset)',border:'1px solid var(--border-subtle)',cursor:'pointer',overflow:'hidden'}}>
            <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='var(--text-muted)' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='4'/><path d='M12 2v2M12 20v2M2 12h2M20 12h2'/></svg>
            <span style={{fontSize:13,color:'var(--text-secondary)',whiteSpace:'nowrap'}}>Custom RGB</span>
            <input type='color' value={accent} onChange={e=>setAccent(e.target.value)} style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:0,cursor:'pointer',border:'none',padding:0,margin:0}}/>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,height:40,padding:'0 12px',borderRadius:10,background:'var(--surface-inset)',border:'1px solid var(--border-subtle)'}}>
            <div style={{width:13,height:13,borderRadius:'50%',background:accent,flexShrink:0}}/>
            <span style={{fontFamily:'var(--font-mono)',fontSize:12.5,color:'var(--text-primary)'}}>{accent}</span>
          </div>
        </div>
      </div>

      {/* Density */}
      <div style={card}>
        <div style={{fontSize:11,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-muted)',fontWeight:600,marginBottom:14}}>Content density</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {DENSITIES.map(d=>(
            <button key={d.v} onClick={()=>setDensity(d.v as any)} style={optCard(density===d.v)}>
              <div style={{display:'flex',flexDirection:'column',gap:parseInt(d.gap)/2,marginBottom:13}}>
                <div style={{height:7,borderRadius:3,background:'currentColor',opacity:.3}}/>
                <div style={{height:4,borderRadius:3,background:'currentColor',opacity:.15}}/>
                <div style={{height:4,borderRadius:3,background:'currentColor',opacity:.15}}/>
                <div style={{height:4,borderRadius:3,background:'currentColor',opacity:.15}}/>
              </div>
              <div style={{fontSize:13,fontWeight:600,color:density===d.v?accent:'var(--text-primary)'}}>{d.label}</div>
              <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>{d.gap} gaps</div>
            </button>
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div style={{...card,boxShadow:'0 0 24px rgba(0,212,255,.08)'}}>
        <div style={{fontSize:11,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-muted)',fontWeight:600,marginBottom:16}}>Live preview</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'var(--gap)'}}>
          <div style={{background:'var(--surface-inset)',border:'1px solid var(--border-subtle)',borderRadius:12,padding:16}}><div style={{fontSize:12,color:'var(--text-muted)'}}>Today's revenue</div><div style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:700,color:'var(--text-primary)',marginTop:8}}>$4,820</div><div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--success-500)',marginTop:3}}>&uarr; 12.4%</div></div>
          <div style={{background:'var(--surface-inset)',border:'1px solid var(--border-subtle)',borderRadius:12,padding:16}}><div style={{fontSize:12,color:'var(--text-muted)'}}>Win rate</div><div style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:700,color:'var(--text-primary)',marginTop:8}}>27.6%</div><div style={{fontFamily:'var(--font-mono)',fontSize:11,color:accent,marginTop:3}}>332 products</div></div>
          <div style={{display:'flex',flexDirection:'column',gap:10,justifyContent:'center'}}>
            <button style={{height:40,borderRadius:10,background:accent,color:'var(--on-accent)',border:'none',fontFamily:'var(--font-body)',fontSize:13,fontWeight:600,cursor:'pointer'}}>Primary action</button>
            <button style={{height:40,borderRadius:10,background:'var(--surface-inset)',color:'var(--text-secondary)',border:'1px solid var(--border-subtle)',fontFamily:'var(--font-body)',fontSize:13,cursor:'pointer'}}>Secondary</button>
          </div>
        </div>
      </div>
    </div>
  );
}