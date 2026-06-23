import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
type ProductResult = { productASIN:string; status:string; };
type CheckedData = { results:Record<string,ProductResult[]>; skipped:{productUPC:string}[]; timestamp:string; };
const card: React.CSSProperties = { background:'var(--surface-card)', border:'1px solid var(--border-subtle)', borderRadius:16, backdropFilter:'blur(12px)' };
const badge = (tone:'success'|'warning'|'danger') => ({
  display:'inline-flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:99,fontSize:11.5,fontWeight:600,
  background: tone==='success'?'rgba(43,217,160,.15)':tone==='warning'?'rgba(245,166,35,.15)':'rgba(255,90,90,.15)',
  color: tone==='success'?'var(--success-500)':tone==='warning'?'var(--warning-500)':'var(--danger-500)',
  border: `1px solid ${tone==='success'?'rgba(43,217,160,.3)':tone==='warning'?'rgba(245,166,35,.3)':'rgba(255,90,90,.3)'}`
} as React.CSSProperties);

function statusTone(s:string): 'success'|'warning'|'danger' {
  const lower=s.toLowerCase();
  if(lower.includes('can sell')||lower.includes('ungated')) return 'success';
  if(lower.includes('apply')||lower.includes('approval')) return 'warning';
  return 'danger';
}

export default function CheckOnAmz() {
  const { accent } = useApp();
  const [loading,setLoading]=useState(false);
  const [checkedData,setCheckedData]=useState<CheckedData|null>(null);
  const [error,setError]=useState<string|null>(null);
  const [downloading,setDownloading]=useState(false);
  const [showAll,setShowAll]=useState(false);
  const [agentResponse,setAgentResponse]=useState<string|null>(null);
  const [showSearchKeyModal,setShowSearchKeyModal]=useState(false);
  const [selectedKey,setSelectedKey]=useState('');
  const [searchKeys,setSearchKeys]=useState<string[]>([]);
  const [sendingSearchKey,setSendingSearchKey]=useState(false);

  function extractMainResponse(json:any):string { for(const e of json){const p=e?.content?.parts?.[0];if(p?.text)return p.text;} return 'No main response found.'; }

  const handleCheckOnAmzClick = async () => {
    setLoading(true); setError(null);
    try {
      const res=await fetch('http://localhost:51483/api/get_scraped_data',{method:'GET',headers:{'ngrok-skip-browser-warning':'true'}});
      const data=await res.json();
      if(data.status==='success'){
        const parsed=JSON.parse(data.raw_string).data;
        if(parsed?.length>0){setSearchKeys(Object.keys(parsed[0]));setShowSearchKeyModal(true);}
        else setError('No scraped data found.');
      } else setError('Failed to load scraped data.');
    } catch { setError('Failed to fetch scraped data.'); }
    finally { setLoading(false); }
  };

  const handleSendSearchKey = async () => {
    if(!selectedKey) return; setSendingSearchKey(true);
    try {
      const res=await fetch('http://localhost:51483/api/get_scraped_data',{method:'GET',headers:{'ngrok-skip-browser-warning':'true'}});
      const data=await res.json(); let unitList:any[]=[];
      if(data.status==='success'){const parsed=JSON.parse(data.raw_string).data;unitList=parsed.map((i:any)=>i[selectedKey]).filter(Boolean);}
      await fetch('http://localhost:51483/search-key',{method:'POST',headers:{'ngrok-skip-browser-warning':'true','Content-Type':'application/json'},body:JSON.stringify({search_key:selectedKey,values:unitList})});
      setShowSearchKeyModal(false); setSelectedKey(''); setError('Search key sent! Checking on Amazon…');
      await runAgentForAmazonCheck();
    } catch { setError('Failed to send search key.'); }
    finally { setSendingSearchKey(false); }
  };

  const runAgentForAmazonCheck = async () => {
    setLoading(true); setError(null); setAgentResponse(null);
    const userId='us',sessionId='st',appName='AMAVAGENT';
    const promptText='Hello from Server scraping is done wholesaler\'s website now start checking on Amazon';
    try {
      let response=await fetch('http://localhost:51483/run',{method:'POST',headers:{'ngrok-skip-browser-warning':'true','Content-Type':'application/json'},body:JSON.stringify({appName,userId,sessionId,newMessage:{role:'user',parts:[{text:promptText}]}})});
      const text=await response.text();
      if(text.includes('"detail":"Session not found"')){
        await fetch(`http://localhost:51483/apps/${appName}/users/${userId}/sessions/${sessionId}`,{method:'POST',headers:{'ngrok-skip-browser-warning':'true','Content-Type':'application/json'},body:JSON.stringify({state:{key1:'value1',key2:42}})});
        response=await fetch('http://localhost:51483/run',{method:'POST',headers:{'ngrok-skip-browser-warning':'true','Content-Type':'application/json'},body:JSON.stringify({appName,userId,sessionId,newMessage:{role:'user',parts:[{text:promptText}]}})});
      }
      const retryText=await response.text(); let main='No main response found.';
      try{const json=JSON.parse(retryText);main=extractMainResponse(json);}catch{main=retryText;}
      setAgentResponse(main); setError('Started checking on Amazon. We will notify you after its done!');
    } catch(err) { setError(`Failed to contact agent. ${err}`); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const fetchCheckedData = async () => {
      setLoading(true); setError(null); setCheckedData(null); setAgentResponse(null);
      try {
        const response=await fetch('http://localhost:51483/checkeddata',{method:'GET',headers:{'ngrok-skip-browser-warning':'true','Content-Type':'application/json'}});
        if(!response.ok) throw new Error('Failed to fetch');
        const data=await response.json();
        if(!data.checked_data?.results||Object.keys(data.checked_data.results).length===0) await runAgentForAmazonCheck();
        else setCheckedData(data.checked_data);
      } catch { await runAgentForAmazonCheck(); }
      finally { setLoading(false); }
    };
    fetchCheckedData();
    const interval=setInterval(fetchCheckedData,600000);
    return ()=>clearInterval(interval);
  },[]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response=await fetch('http://localhost:51483/exceldata',{method:'GET',headers:{'ngrok-skip-browser-warning':'true','Content-Type':'application/json'}});
      const data=await response.json(); const merged=data.merged_data; const rows:any[]=[];
      merged.forEach((item:any)=>{
        if(Array.isArray(item.amazon_data)&&item.amazon_data.length>0) item.amazon_data.forEach((ad:any)=>rows.push({...item,productASIN:ad.productASIN,status:ad.status}));
        else rows.push({...item,productASIN:'',status:''});
      });
      rows.forEach(r=>delete r.amazon_data);
      const ws=XLSX.utils.json_to_sheet(rows),wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,ws,'MergedData'); XLSX.writeFile(wb,'merged_data.xlsx');
    } catch { setError('Failed to download Excel.'); }
    finally { setDownloading(false); }
  };

  const flatProducts = checkedData ? Object.entries(checkedData.results).flatMap(([k,ps])=>ps.map(p=>({Search_key:k,product:p}))) : [];
  const inputStyle: React.CSSProperties = { width:'100%',height:44,padding:'0 14px',borderRadius:10,background:'var(--surface-inset)',border:'1px solid var(--border-subtle)',color:'var(--text-primary)',fontFamily:'var(--font-body)',fontSize:14,outline:'none',boxSizing:'border-box' as const };

  return (
    <div style={{maxWidth:1100,margin:'0 auto',display:'flex',flexDirection:'column',gap:'var(--gap)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14}}>
        <div>
          {checkedData && <p style={{margin:'6px 0 0',fontSize:13,color:'var(--text-muted)'}}>Last checked · {new Date(checkedData.timestamp).toLocaleString()} · {flatProducts.length} ASINs</p>}
        </div>
        <div style={{display:'flex',gap:10}}>
          {checkedData && <button onClick={handleDownload} disabled={downloading} style={{height:44,padding:'0 18px',borderRadius:12,background:'var(--surface-inset)',color:'var(--text-secondary)',border:'1px solid var(--border-subtle)',fontFamily:'var(--font-body)',fontSize:14,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>{downloading?'Downloading…':'⬇ Export Excel'}</button>}
          <button onClick={handleCheckOnAmzClick} disabled={loading||!checkedData} style={{height:44,padding:'0 20px',borderRadius:12,background:accent,color:'var(--on-accent)',border:'none',fontFamily:'var(--font-body)',fontSize:14,fontWeight:600,cursor:'pointer'}}>{loading?'Checking…':'Re-check on Amazon'}</button>
        </div>
      </div>

      {loading && <div style={{textAlign:'center',padding:40,color:'var(--text-muted)',display:'flex',alignItems:'center',justifyContent:'center',gap:12}}><span style={{width:20,height:20,border:`2px solid var(--border-subtle)`,borderTopColor:accent,borderRadius:'50%',display:'inline-block',animation:'auriq-spin .9s linear infinite'}}/>Checking on Amazon…</div>}
      {error && <div style={{padding:14,borderRadius:12,background:'var(--accent-soft)',border:'1px solid var(--border-accent)',color:accent,fontSize:13.5}}>{error}</div>}
      {agentResponse && <div style={{...card,padding:16}}><div style={{fontSize:12,fontWeight:600,color:'var(--text-muted)',marginBottom:6}}>AGENT RESPONSE</div><div style={{fontSize:13.5,color:'var(--text-primary)',lineHeight:1.6}}>{agentResponse}</div></div>}

      {checkedData && (
        <div style={card}>
          <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr auto',gap:14,padding:'12px 22px',borderBottom:'1px solid var(--border-subtle)',fontSize:11,letterSpacing:'.12em',textTransform:'uppercase' as const,color:'var(--text-muted)',fontWeight:600}}>
            <span>Search key</span><span>ASIN</span><span>Status</span><span/>
          </div>
          {flatProducts.slice(0,showAll?undefined:50).map(({Search_key,product},idx)=>(
            <div key={Search_key+idx} style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr auto',gap:14,padding:'14px 22px',borderBottom:'1px solid var(--border-subtle)',alignItems:'center'}}>
              <span style={{fontSize:13.5,color:'var(--text-primary)',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{Search_key}</span>
              <span style={{fontFamily:'var(--font-mono)',fontSize:13,color:'var(--text-secondary)'}}>{product.productASIN}</span>
              <span><span style={badge(statusTone(product.status))}>{product.status}</span></span>
              <a href={`https://www.amazon.com/dp/${product.productASIN}`} target="_blank" rel="noopener noreferrer" style={{fontSize:12.5,color:accent,textDecoration:'none',fontWeight:600,whiteSpace:'nowrap'}}>View ↗</a>
            </div>
          ))}
          {flatProducts.length>50 && !showAll && (
            <div style={{padding:'16px 22px'}}><button onClick={()=>setShowAll(true)} style={{background:'var(--accent-soft)',color:accent,border:'1px solid var(--border-accent)',borderRadius:10,padding:'8px 18px',fontFamily:'var(--font-body)',fontSize:13,fontWeight:600,cursor:'pointer'}}>Load all {flatProducts.length} results</button></div>
          )}
          {checkedData.skipped?.length>0 && (
            <div style={{padding:'16px 22px',borderTop:'1px solid var(--border-subtle)'}}>
              <div style={{fontSize:12,fontWeight:600,color:'var(--text-muted)',marginBottom:8}}>SKIPPED ({checkedData.skipped.length})</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {checkedData.skipped.map((item,i)=><span key={i} style={{fontFamily:'var(--font-mono)',fontSize:12,padding:'3px 8px',borderRadius:6,background:'var(--surface-inset)',color:'var(--text-muted)'}}>{item.productUPC}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {showSearchKeyModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
          <div style={{...card,padding:28,width:420,maxWidth:'90vw'}}>
            <h3 style={{margin:'0 0 16px',fontSize:16,fontWeight:700,color:'var(--text-primary)'}}>Select unit/column for Amazon check</h3>
            <select value={selectedKey} onChange={e=>setSelectedKey(e.target.value)} style={{...inputStyle,marginBottom:16}}>
              <option value="">Select column…</option>
              {searchKeys.map(k=><option key={k} value={k}>{k}</option>)}
            </select>
            <div style={{display:'flex',gap:10}}>
              <button disabled={!selectedKey||sendingSearchKey} onClick={handleSendSearchKey} style={{flex:1,height:44,borderRadius:10,background:accent,color:'var(--on-accent)',border:'none',fontFamily:'var(--font-body)',fontSize:14,fontWeight:600,cursor:'pointer'}}>{sendingSearchKey?'Sending…':'Submit'}</button>
              <button onClick={()=>setShowSearchKeyModal(false)} style={{flex:1,height:44,borderRadius:10,background:'var(--surface-inset)',color:'var(--text-secondary)',border:'1px solid var(--border-subtle)',fontFamily:'var(--font-body)',fontSize:14,cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}