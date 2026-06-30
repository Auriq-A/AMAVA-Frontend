import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getEmail, clearAuth } from '../lib/auth';

const NAV = [
  { group: 'WORKSPACE', items: [{ path:'/', label:'Dashboard', icon:'dashboard' }] },
  { group: 'RESEARCH', items: [
    { path:'/search', label:'Product Search', icon:'search' },
    { path:'/scraped', label:'Winning Products', icon:'trophy' },
    { path:'/ungated', label:'Check Un/Gated', icon:'lock' },
    { path:'/fba-profit-calculator', label:'Revenue Calculator', icon:'calc' },
  ]},
  { group: 'ANALYTICS', items: [
    { path:'/sales', label:'Sales', icon:'bag' },
    { path:'/sales-performance', label:'Performance', icon:'chart' },
  ]},
  { group: 'TOOLS', items: [
    { path:'/chat', label:'AMAVA Assistant', icon:'chat' },
    { path:'/progress', label:'Scraping Progress', icon:'activity' },
  ]},
  { group: 'SETTINGS', items: [
    { path:'/connect', label:'Connect accounts', icon:'link' },
    { path:'/appearance', label:'Appearance', icon:'sun' },
  ]},
];

const PAGE_INFO: Record<string,{title:string;subtitle:string}> = {
  '/': { title:'Dashboard', subtitle:'Your sourcing pipeline at a glance' },
  '/search': { title:'Product Search', subtitle:'Scrape supplier catalogs for Amazon matches' },
  '/scraped': { title:'Winning Products', subtitle:'High-margin matches from your latest scrape' },
  '/ungated': { title:'Check Un/Gated', subtitle:'Verify eligibility against your seller account' },
  '/fba-profit-calculator': { title:'Revenue Calculator', subtitle:'Project net profit after FBA fees' },
  '/sales': { title:'Sales', subtitle:"Today's Amazon order activity" },
  '/sales-performance': { title:'Performance', subtitle:'Revenue and units over time' },
  '/chat': { title:'AMAVA Assistant', subtitle:'Your AI sourcing co-pilot' },
  '/progress': { title:'Scraping Progress', subtitle:'Live view of the browsing agent' },
  '/connect': { title:'Connect accounts', subtitle:'Manage Amazon SP-API and supplier credentials' },
  '/appearance': { title:'Appearance', subtitle:'Theme, accent color, and layout density' },
};

const ICONS: Record<string, React.ReactNode> = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.5-4.5"/></svg>,
  trophy: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10v3.5a5 5 0 0 1-10 0V4Z"/><path d="M7 5.5H4.2V7a3 3 0 0 0 3 3"/><path d="M17 5.5h2.8V7a3 3 0 0 1-3 3"/><path d="M9.3 14.4 9 17.5h6l-.3-3.1M7.5 20.5h9"/></svg>,
  lock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10.5" width="16" height="9.5" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 7.7-1.4"/></svg>,
  calc: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="2.2"/><rect x="8" y="6" width="8" height="3" rx="1"/><path d="M8.5 13h0M12 13h0M15.5 13h0M8.5 17h0M12 17h0M15.5 17h0"/></svg>,
  bag: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h12l-1 13.2H7L6 7Z"/><path d="M9 7V5.2a3 3 0 0 1 6 0V7"/></svg>,
  chart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4v16h16"/><path d="m7.5 14.5 3.5-4 3 2.6 4.5-6.1"/></svg>,
  chat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9.5L5 20.5V6a1 1 0 0 1 1-1Z"/><path d="M9 10h6M9 13h3.5"/></svg>,
  activity: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2-6.5L13 18l2-6h6"/></svg>,
  link: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  sun: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>,
  moon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20.5 14.5A8 8 0 1 1 9.5 3.5a6.3 6.3 0 0 0 11 11Z"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>,
};

const s: Record<string, React.CSSProperties> = {
  shell: { display:'flex', minHeight:'100vh', background:'var(--bg-base)', color:'var(--text-primary)', fontFamily:'var(--font-body)' },
  sidebar: { width:248, flexShrink:0, display:'flex', flexDirection:'column', background:'var(--bg-sunken)', borderRight:'1px solid var(--border-subtle)', position:'sticky', top:0, height:'100vh', overflowY:'auto' },
  logoArea: { display:'flex', alignItems:'center', gap:12, padding:'22px 20px 18px' },
  logoMark: { width:40, height:40, borderRadius:11, background:'var(--grad-brand)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--glow-sm)', flexShrink:0 },
  logoText: { fontFamily:'var(--font-display)', fontWeight:800, fontSize:19, letterSpacing:'.16em', color:'var(--text-primary)', lineHeight:1 },
  logoSub: { fontSize:10, letterSpacing:'.22em', textTransform:'uppercase' as const, color:'var(--text-muted)', marginTop:4 },
  navGroup: { padding:'14px 10px 6px', fontSize:10.5, letterSpacing:'.16em', textTransform:'uppercase' as const, color:'var(--text-muted)', fontWeight:600 },
  navBody: { flex:1, padding:'4px 14px 12px', display:'flex', flexDirection:'column' as const, gap:2 },
  main: { flex:1, minWidth:0, display:'flex', flexDirection:'column' as const, background:'var(--bg-base)' },
  topbar: { height:68, flexShrink:0, display:'flex', alignItems:'center', gap:16, padding:'0 32px', borderBottom:'1px solid var(--border-subtle)', position:'sticky' as const, top:0, zIndex:20, background:'var(--surface-glass)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)' },
  searchBar: { display:'flex', alignItems:'center', gap:8, height:38, padding:'0 13px', borderRadius:10, background:'var(--surface-inset)', border:'1px solid var(--border-subtle)', width:220 },
  searchInput: { flex:1, minWidth:0, border:'none', outline:'none', background:'transparent', color:'var(--text-primary)', fontFamily:'var(--font-body)', fontSize:13 },
  iconBtn: { width:40, height:40, border:'1px solid var(--border-subtle)', borderRadius:10, background:'var(--surface-inset)', color:'var(--text-secondary)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'var(--transition-all)', flexShrink:0 },
  userCard: { margin:'12px 14px 16px', padding:'13px 14px', borderRadius:14, background:'var(--surface-card)', border:'1px solid var(--border-subtle)', display:'flex', alignItems:'center', gap:11 },
  avatar: { width:36, height:36, borderRadius:'50%', background:'var(--grad-brand)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'var(--on-accent)', fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 },
  content: { flex:1, overflowY:'auto' as const, padding:'28px 32px' },
};

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, accent } = useApp();
  const info = PAGE_INFO[location.pathname] || { title:'AMAVA', subtitle:'' };
  const email = getEmail();
  const onAccount = () => { if (email) clearAuth(); navigate('/login'); };

  const navBtn = (active: boolean): React.CSSProperties => ({
    display:'flex', alignItems:'center', gap:12, width:'100%',
    padding:'9px 12px', borderRadius:10, cursor:'pointer',
    border: active ? '1px solid var(--border-accent)' : '1px solid transparent',
    background: active ? 'var(--accent-soft)' : 'transparent',
    color: active ? accent : 'var(--text-secondary)',
    fontFamily:'var(--font-body)', fontSize:14,
    fontWeight: active ? 600 : 500, textAlign:'left', transition:'var(--transition-all)',
  });

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.logoArea}>
          <div style={s.logoMark}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 20L10 4l4.2 9.6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.5 13.5a5 5 0 1 1-5-5 5 5 0 0 1 5 5Zm0 0 1.5 3" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div style={s.logoText}>AURIQ</div>
            <div style={s.logoSub}>FBA Intelligence</div>
          </div>
        </div>
        <nav style={s.navBody}>
          {NAV.map(group => (
            <React.Fragment key={group.group}>
              <div style={s.navGroup}>{group.group}</div>
              {group.items.map(item => (
                <button key={item.path} onClick={() => navigate(item.path)} style={navBtn(location.pathname===item.path)}>
                  {ICONS[item.icon]}
                  {item.label}
                </button>
              ))}
            </React.Fragment>
          ))}
        </nav>
        <div style={s.userCard}>
          <div style={s.avatar}>{email ? email.slice(0,2).toUpperCase() : 'AA'}</div>
          <div style={{minWidth:0,flex:1}}>
            <div style={{fontSize:13.5,fontWeight:600,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{email || 'Not signed in'}</div>
            <button onClick={onAccount} style={{background:'none',border:'none',padding:0,cursor:'pointer',fontSize:11.5,color:'var(--text-muted)',fontFamily:'var(--font-body)'}}>
              {email ? 'Log out' : 'Sign in'}
            </button>
          </div>
          <div style={{width:8,height:8,borderRadius:'50%',background:email?'var(--success-500)':'var(--text-muted)',flexShrink:0}}/>
        </div>
      </aside>

      <div style={s.main}>
        <header style={s.topbar}>
          <div style={{flex:1,minWidth:0}}>
            <h1 style={{margin:0,fontFamily:'var(--font-display)',fontSize:18,fontWeight:700,color:'var(--text-primary)'}}>{info.title}</h1>
            <p style={{margin:'2px 0 0',fontSize:12,color:'var(--text-muted)'}}>{info.subtitle}</p>
          </div>
          <div style={s.searchBar}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.5-4.5"/></svg>
            <input placeholder="Search products, ASINs…" style={s.searchInput}/>
            <kbd style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-muted)',border:'1px solid var(--border-subtle)',borderRadius:4,padding:'1px 4px'}}>⌘K</kbd>
          </div>
          <button style={s.iconBtn} aria-label="Notifications">{ICONS.bell}</button>
          <button style={s.iconBtn} aria-label="Toggle theme" onClick={toggleTheme}>{theme==='dark'?ICONS.sun:ICONS.moon}</button>
        </header>
        <main style={s.content} className="auriq-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}