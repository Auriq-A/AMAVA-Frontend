import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
const card: React.CSSProperties = { background:'var(--surface-card)', border:'1px solid var(--border-subtle)', borderRadius:16, backdropFilter:'blur(12px)' };
const iStyle: React.CSSProperties = { width:'100%',height:44,padding:'0 14px',borderRadius:10,background:'var(--surface-inset)',border:'1px solid var(--border-subtle)',color:'var(--text-primary)',fontFamily:'var(--font-body)',fontSize:14,outline:'none',boxSizing:'border-box' as const };
const lStyle: React.CSSProperties = { display:'block',fontSize:13,fontWeight:500,color:'var(--text-secondary)',marginBottom:7 };
type Status = 'idle'|'saving'|'connected';

const MARKETPLACES = [
  {group:'North America',items:[{v:'US',l:'United States'},{v:'CA',l:'Canada'},{v:'MX',l:'Mexico'},{v:'BR',l:'Brazil'}]},
  {group:'Europe',items:[{v:'UK',l:'United Kingdom'},{v:'DE',l:'Germany'},{v:'FR',l:'France'},{v:'IT',l:'Italy'},{v:'ES',l:'Spain'},{v:'NL',l:'Netherlands'},{v:'SE',l:'Sweden'},{v:'PL',l:'Poland'},{v:'BE',l:'Belgium'},{v:'TR',l:'Turkey'},{v:'AE',l:'UAE'},{v:'SA',l:'Saudi Arabia'},{v:'EG',l:'Egypt'},{v:'IN',l:'India'}]},
  {group:'Far East',items:[{v:'JP',l:'Japan'},{v:'AU',l:'Australia'},{v:'SG',l:'Singapore'}]},
];

export default function ConnectAccounts() {
  const { accent } = useApp();
  const [spapiStatus,setSpapiStatus]=useState<Status>('idle');
  const [sellerId,setSellerId]=useState('');
  const [clientId,setClientId]=useState('');
  const [clientSecret,setClientSecret]=useState('');
  const [refreshToken,setRefreshToken]=useState('');
  const [marketplace,setMarketplace]=useState('US');
  const [supStatus,setSupStatus]=useState<Record<string,Status>>({avasam:'idle',lots888:'idle',frontier:'idle'});
  const [supFields,setSupFields]=useState<Record<string,{f1:string;f2:string}>>({avasam:{f1:'',f2:''},lots888:{f1:'',f2:''},frontier:{f1:'',f2:''}});

  const saveSpapi = () => {
    setSpapiStatus('saving');
    setTimeout(()=>setSpapiStatus('connected'),1400);
  };
  const disconnectSpapi = () => { setSpapiStatus('idle'); setSellerId(''); setClientId(''); setClientSecret(''); setRefreshToken(''); };
  const connectSup = (id:string) => () => { setSupStatus(s=>({...s,[id]:'saving'})); setTimeout(()=>setSupStatus(s=>({...s,[id]:'connected'})),1400); };
  const disconnectSup = (id:string) => () => setSupStatus(s=>({...s,[id]:'idle'}));
  const setSupF = (id:string,f:'f1'|'f2') => (e:React.ChangeEvent<HTMLInputElement>) => setSupFields(s=>({...s,[id]:{...s[id],[f]:e.target.value}}));

  const statusBadge = (st:Status) => ({
    display:'inline-flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:99,fontSize:11.5,fontWeight:600,
    background:st==='connected'?'rgba(43,217,160,.15)':'var(--surface-inset)',
    color:st==='connected'?'var(--success-500)':st==='saving'?accent:'var(--text-muted)',
    border:'1px solid '+(st==='connected'?'rgba(43,217,160,.3)':'var(--border-subtle)'),
  } as React.CSSProperties);

  const primaryBtn = (disabled=false): React.CSSProperties => ({ height:44,padding:'0 20px',borderRadius:12,background:disabled?'var(--surface-inset)':accent,color:disabled?'var(--text-muted)':'var(--on-accent)',border:'none',fontFamily:'var(--font-body)',fontSize:14,fontWeight:600,cursor:disabled?'not-allowed':'pointer',transition:'var(--transition-all)',display:'flex',alignItems:'center',gap:8 });
  const ghostBtn: React.CSSProperties = { height:44,padding:'0 18px',borderRadius:12,background:'transparent',color:'var(--text-secondary)',border:'1px solid var(--border-subtle)',fontFamily:'var(--font-body)',fontSize:14,cursor:'pointer',transition:'var(--transition-all)' };

  const SUPPLIERS = [
    { id:'avasam', name:'Avasam', mark:'AV', bg:'linear-gradient(135deg,#1B3D7A,#2874C5)', desc:'UK dropshipping marketplace · 200k+ products', f1l:'Email / Username', f1p:'you@avasam.com', f2l:'API Key', f2t:'password' as const },
    { id:'lots888', name:'888lots', mark:'88', bg:'linear-gradient(135deg,#4A1254,#8B2FC9)', desc:'Wholesale lots and surplus goods platform', f1l:'Email / Username', f1p:'you@888lots.com', f2l:'Password', f2t:'password' as const },
    { id:'frontier', name:'Frontier Wholesale', mark:'FW', bg:'linear-gradient(135deg,#1A4A2A,#2D8A50)', desc:'US distributor · public catalog · no login required', f1l:'Account email (optional)', f1p:'you@company.com', f2l:'API key (optional)', f2t:'password' as const },
  ];

  return (
    <div style={{maxWidth:1060,margin:'0 auto',display:'flex',flexDirection:'column',gap:'var(--gap)'}}>

      {/* SP-API */}
      <div>
        <div style={{display:'flex',alignItems:'center',gap:13,marginBottom:16}}>
          <div style={{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#FF9900,#E47911)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 0 18px rgba(255,153,0,.3)'}}>
            <svg width='22' height='22' viewBox='0 0 24 24' fill='none'><path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' stroke='#fff' strokeWidth='1.7'/><path d='m3.27 6.96 8.73 5.04 8.73-5.04M12 22.08V12' stroke='#fff' strokeWidth='1.7' strokeLinecap='round'/></svg>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <h3 style={{margin:0,fontSize:16,fontWeight:700,color:'var(--text-primary)'}}>Amazon SP-API</h3>
            <p style={{margin:'3px 0 0',fontSize:12,color:'var(--text-muted)'}}>Seller credentials for gating checks, order sync and revenue data</p>
          </div>
          <span style={statusBadge(spapiStatus)}>{spapiStatus==='connected'?'✓ Connected':spapiStatus==='saving'?'Saving…':'Not connected'}</span>
        </div>
        <div style={{...card,padding:24,boxShadow:spapiStatus==='connected'?'0 0 24px rgba(0,212,255,.1)':'none'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div><label style={lStyle}>Seller ID</label><input style={iStyle} value={sellerId} onChange={e=>setSellerId(e.target.value)} placeholder='A2XXXXXXXXXX'/></div>
            <div><label style={lStyle}>Marketplace</label>
              <select value={marketplace} onChange={e=>setMarketplace(e.target.value)} style={{...iStyle,cursor:'pointer'}}>
                {MARKETPLACES.map(g=>(<optgroup key={g.group} label={g.group}>{g.items.map(i=>(<option key={i.v} value={i.v}>{i.l}</option>))}</optgroup>))}
              </select>
            </div>
            <div><label style={lStyle}>LWA Client ID</label><input style={iStyle} value={clientId} onChange={e=>setClientId(e.target.value)} placeholder='amzn1.application-oa2-client.xxx'/></div>
            <div><label style={lStyle}>Client Secret</label><input type='password' style={iStyle} value={clientSecret} onChange={e=>setClientSecret(e.target.value)} placeholder='••••••••••••••••'/></div>
          </div>
          <div style={{marginTop:16}}><label style={lStyle}>LWA Refresh Token</label><input style={iStyle} value={refreshToken} onChange={e=>setRefreshToken(e.target.value)} placeholder='Atzr|IwEBIxxxxxxxxxxxxxxxxxxxx…'/></div>
          <div style={{display:'flex',alignItems:'center',gap:12,marginTop:22,flexWrap:'wrap'}}>
            <button onClick={saveSpapi} style={primaryBtn(spapiStatus==='saving')}>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'><path d='M20 6 9 17l-5-5'/></svg>
              {spapiStatus==='saving'?'Saving…':spapiStatus==='connected'?'Update credentials':'Save & connect'}
            </button>
            {spapiStatus==='connected' && <button onClick={disconnectSpapi} style={ghostBtn}>Disconnect</button>}
            <a href='https://developer-docs.amazon.com/sp-api/docs/creating-and-configuring-iam-policies-and-entities' target='_blank' rel='noopener noreferrer' style={{marginLeft:'auto',fontSize:12.5,color:'var(--text-muted)',textDecoration:'none',display:'flex',alignItems:'center',gap:5,whiteSpace:'nowrap'}}>
              SP-API setup guide <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'/><path d='M15 3h6v6M10 14 21 3'/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Suppliers */}
      <div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:12}}>
          <div><h3 style={{margin:0,fontSize:16,fontWeight:700,color:'var(--text-primary)'}}>Supplier accounts</h3><p style={{margin:'4px 0 0',fontSize:12,color:'var(--text-muted)'}}>Connect wholesale logins so AMAVA can scrape gated catalogs</p></div>
          <button style={{...ghostBtn,display:'flex',alignItems:'center',gap:8,height:40}}>
            <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'><path d='M12 5v14M5 12h14'/></svg>
            Add supplier
          </button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'var(--gap)'}}>
          {SUPPLIERS.map(sup=>{
            const st=supStatus[sup.id];
            const f=supFields[sup.id];
            return (
              <div key={sup.id} style={{...card,padding:22,boxShadow:st==='connected'?'0 0 20px rgba(0,212,255,.08)':'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
                  <div style={{width:46,height:46,borderRadius:13,background:sup.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontFamily:'var(--font-display)',fontSize:15,fontWeight:800,color:'#fff',letterSpacing:'.02em'}}>{sup.mark}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:700,color:'var(--text-primary)'}}>{sup.name}</div>
                    <div style={{fontSize:11.5,color:'var(--text-muted)',marginTop:2}}>{sup.desc}</div>
                  </div>
                  <span style={statusBadge(st)}>{st==='connected'?'✓':st==='saving'?'…':'–'}</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  <div><label style={lStyle}>{sup.f1l}</label><input style={iStyle} value={f.f1} onChange={setSupF(sup.id,'f1')} placeholder={sup.f1p}/></div>
                  <div><label style={lStyle}>{sup.f2l}</label><input type={sup.f2t} style={iStyle} value={f.f2} onChange={setSupF(sup.id,'f2')} placeholder='••••••••••••••••'/></div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginTop:18}}>
                  <button onClick={connectSup(sup.id)} disabled={st==='saving'} style={primaryBtn(st==='saving')}>
                    {st==='saving'?'Connecting…':st==='connected'?'Reconnect':'Connect'}
                  </button>
                  {st==='connected' && <button onClick={disconnectSup(sup.id)} style={ghostBtn}>Disconnect</button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security note */}
      <div style={{display:'flex',alignItems:'flex-start',gap:15,padding:'17px 20px',borderRadius:13,background:'var(--accent-soft)',border:'1px solid var(--border-accent)'}}>
        <svg width='19' height='19' viewBox='0 0 24 24' fill='none' stroke={accent} strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' style={{flexShrink:0,marginTop:1}}><path d='M12 2 3 7v5c0 5.25 3.75 10.15 9 11.4C17.25 22.15 21 17.25 21 12V7l-9-5Z'/><path d='m9 12 2 2 4-4'/></svg>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:accent,marginBottom:5}}>Encrypted credential vault</div>
          <div style={{fontSize:12.5,color:'var(--text-secondary)',lineHeight:1.65}}>All credentials are AES-256 encrypted at rest and stored in an isolated vault. AMAVA never logs or exposes your keys in API responses. You can revoke access or rotate credentials at any time.</div>
        </div>
      </div>
    </div>
  );
}