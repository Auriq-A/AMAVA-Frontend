import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const card: React.CSSProperties = { background:'var(--surface-card)', border:'1px solid var(--border-subtle)', borderRadius:16, backdropFilter:'blur(12px)' };
const inputStyle: React.CSSProperties = { width:'100%', height:44, padding:'0 14px', borderRadius:10, background:'var(--surface-inset)', border:'1px solid var(--border-subtle)', color:'var(--text-primary)', fontFamily:'var(--font-body)', fontSize:14, outline:'none', boxSizing:'border-box' as const };
const label: React.CSSProperties = { display:'block', fontSize:13, fontWeight:500, color:'var(--text-secondary)', marginBottom:7 };

export default function Home() {
  const { accent } = useApp();
  const navigate = useNavigate();
  const [categoryUrl, setCategoryUrl] = useState('');
  const [pages, setPages] = useState('');
  const [mode, setMode] = useState('scratch');
  const [loading, setLoading] = useState(false);
  const [agentResponse, setAgentResponse] = useState<string|null>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function extractMainResponse(json: any): string {
    for (const entry of json) {
      const part = entry?.content?.parts?.[0];
      if (part?.text) return part.text;
    }
    return 'No main response found.';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setAgentResponse(null);
    const userId='us', sessionId='st', appName='AMAVAGENT';
    await fetch(`http://localhost:51483/apps/${appName}/users/${userId}/sessions/${sessionId}`,{method:'POST',headers:{'ngrok-skip-browser-warning':'true','Content-Type':'application/json'},body:JSON.stringify({state:{key1:'value1',key2:42}})});
    const promptText = `Hey scrape me this wholesale/distributor's website URL: ${categoryUrl} and Start from zero = ${mode==='scratch'?'True':'False'} and pages = ${pages} (I have reviewed everything jst start scraping)`;
    try {
      const response = await fetch('http://localhost:51483/run',{method:'POST',headers:{'ngrok-skip-browser-warning':'true','Content-Type':'application/json'},body:JSON.stringify({appName,userId,sessionId,newMessage:{role:'user',parts:[{text:promptText}]}})});
      const text = await response.text();
      let main='No main response found.';
      try { const json=JSON.parse(text); main=extractMainResponse(json); } catch { main=text; }
      setAgentResponse(main);
    } catch { setAgentResponse('Error contacting agent.'); }
    finally { setLoading(false); }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result; if (!data) return;
      const wb = XLSX.read(data,{type:'binary'}), ws = wb.Sheets[wb.SheetNames[0]];
      setExcelData(XLSX.utils.sheet_to_json(ws,{defval:''})); setShowExcelModal(true);
    };
    reader.readAsBinaryString(file);
  };

  const handleExcelSubmit = async () => {
    if (!selectedKey) return; setUploading(true);
    const updatedData = excelData.map(row=>({...row,search_key:row[selectedKey],unit:selectedKey}));
    try {
      await fetch('http://localhost:51483/api/scraped_dataresults',{method:'POST',headers:{'ngrok-skip-browser-warning':'true','Content-Type':'application/json'},body:JSON.stringify({data:updatedData})});
      setShowExcelModal(false); setExcelData([]); setSelectedKey('');
    } catch { alert('Failed to upload Excel data.'); }
    finally { setUploading(false); }
  };

  const excelKeys = excelData.length>0 ? Object.keys(excelData[0]) : [];
  const canSubmit = !loading && categoryUrl.trim() && pages.trim();

  return (
    <div style={{maxWidth:840,margin:'0 auto',display:'flex',flexDirection:'column',gap:'var(--gap)'}}>
      <div style={{...card,padding:28,boxShadow:`0 0 32px rgba(0,212,255,.08)`}}>
        <h2 style={{margin:'0 0 6px',fontFamily:'var(--font-display)',fontSize:20,fontWeight:700,color:'var(--text-primary)'}}>Scrape a supplier catalog</h2>
        <p style={{margin:'0 0 24px',fontSize:13.5,color:'var(--text-muted)'}}>Point AMAVA at a wholesaler URL — it pulls the full product list for Amazon matching.</p>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div><label style={label}>Catalog URL</label><input type="text" value={categoryUrl} onChange={e=>setCategoryUrl(e.target.value)} placeholder="https://wholesaler.com/category/all" style={inputStyle} required/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div><label style={label}>Pages to crawl</label><input type="number" min={1} value={pages} onChange={e=>setPages(e.target.value)} placeholder="e.g. 12" style={inputStyle} required/></div>
            <div><label style={label}>Mode</label>
              <div style={{display:'flex',gap:8}}>
                {['scratch','resume'].map(m=>(
                  <button key={m} type="button" onClick={()=>setMode(m)} style={{flex:1,height:44,borderRadius:10,cursor:'pointer',border:`1px solid ${mode===m?'var(--border-accent)':'var(--border-subtle)'}`,background:mode===m?'var(--accent-soft)':'var(--surface-inset)',color:mode===m?accent:'var(--text-secondary)',fontFamily:'var(--font-body)',fontSize:13,fontWeight:600,transition:'var(--transition-all)'}}>
                    {m==='scratch'?'From scratch':'Resume'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:12,marginTop:4}}>
            <button type="submit" disabled={!canSubmit} style={{height:44,padding:'0 24px',borderRadius:12,background:canSubmit?accent:'var(--surface-inset)',color:canSubmit?'var(--on-accent)':'var(--text-muted)',border:'none',fontFamily:'var(--font-body)',fontSize:14,fontWeight:600,cursor:canSubmit?'pointer':'not-allowed',transition:'var(--transition-all)',display:'flex',alignItems:'center',gap:8}}>
              {loading ? <span style={{width:16,height:16,border:'2px solid var(--on-accent)',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'auriq-spin .9s linear infinite'}}/> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v18l15-9L5 3Z"/></svg>}
              {loading?'Dispatching agent…':'Start scraping'}
            </button>
            <button type="button" onClick={()=>fileInputRef.current?.click()} style={{height:44,padding:'0 20px',borderRadius:12,background:'var(--surface-inset)',color:'var(--text-secondary)',border:'1px solid var(--border-subtle)',fontFamily:'var(--font-body)',fontSize:14,fontWeight:500,cursor:'pointer',transition:'var(--transition-all)',display:'flex',alignItems:'center',gap:8}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m0 0L8 8m4-4 4 4M5 20h14"/></svg>
              Upload Excel
            </button>
          </div>
        </form>
        <input type="file" accept=".xlsx,.xls" ref={fileInputRef} onChange={handleExcelUpload} style={{display:'none'}}/>
      </div>

      {agentResponse && (
        <div style={{...card,padding:20}}>
          <div style={{display:'flex',alignItems:'center',gap:13}}>
            <span style={{width:9,height:9,borderRadius:'50%',background:'var(--success-500)',flexShrink:0,animation:'auriq-pulse 1.4s ease-in-out infinite'}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:'var(--text-primary)'}}>Agent dispatched</div>
              <div style={{fontSize:12.5,color:'var(--text-muted)',marginTop:2}}>{agentResponse}</div>
            </div>
            <button onClick={()=>navigate('/progress')} style={{height:34,padding:'0 14px',borderRadius:8,background:'transparent',color:accent,border:'none',fontFamily:'var(--font-body)',fontSize:13,fontWeight:600,cursor:'pointer'}}>View progress →</button>
          </div>
        </div>
      )}

      {showExcelModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
          <div style={{...card,padding:28,width:400,maxWidth:'90vw'}}>
            <h3 style={{margin:'0 0 16px',fontSize:16,fontWeight:700,color:'var(--text-primary)'}}>Select column for Amazon check</h3>
            <select value={selectedKey} onChange={e=>setSelectedKey(e.target.value)} style={{...inputStyle,marginBottom:16}}>
              <option value="">Select column…</option>
              {excelKeys.map(k=><option key={k} value={k}>{k}</option>)}
            </select>
            <div style={{display:'flex',gap:10}}>
              <button disabled={!selectedKey||uploading} onClick={handleExcelSubmit} style={{flex:1,height:44,borderRadius:10,background:accent,color:'var(--on-accent)',border:'none',fontFamily:'var(--font-body)',fontSize:14,fontWeight:600,cursor:'pointer'}}>{uploading?'Uploading…':'Submit'}</button>
              <button onClick={()=>setShowExcelModal(false)} style={{flex:1,height:44,borderRadius:10,background:'var(--surface-inset)',color:'var(--text-secondary)',border:'1px solid var(--border-subtle)',fontFamily:'var(--font-body)',fontSize:14,cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}