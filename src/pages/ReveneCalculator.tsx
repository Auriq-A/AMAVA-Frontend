import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
interface ProfitResult { asin:string; price:number; fees:number; cost:number; profit:number; }
const card: React.CSSProperties = { background:'var(--surface-card)', border:'1px solid var(--border-subtle)', borderRadius:16, backdropFilter:'blur(12px)' };
const iStyle: React.CSSProperties = { width:'100%',height:44,padding:'0 14px',borderRadius:10,background:'var(--surface-inset)',border:'1px solid var(--border-subtle)',color:'var(--text-primary)',fontFamily:'var(--font-body)',fontSize:14,outline:'none',boxSizing:'border-box' as const };
const lStyle: React.CSSProperties = { display:'block',fontSize:13,fontWeight:500,color:'var(--text-secondary)',marginBottom:7 };

export default function FBAProfitCalculatorPage() {
  const { accent } = useApp();
  const [asin,setAsin]=useState('');
  const [cost,setCost]=useState('');
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState<ProfitResult|null>(null);
  const [error,setError]=useState('');
  const [allResults,setAllResults]=useState<ProfitResult[]>([]);
  const [allLoading,setAllLoading]=useState(false);

  const handleCalculate = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res=await fetch('https://amava-backend-production.up.railway.app/fba-profit-calculator',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({asin,cost:parseFloat(cost)})});
      if(!res.ok){const e=await res.json();throw new Error(e.error||'Failed to calculate.');}
      setResult(await res.json());
    } catch(err:any){setError(err.message||'Something went wrong.');}
    finally{setLoading(false);}
  };

  const CalculateAllCheckedProduct = async () => {
    setAllLoading(true); setAllResults([]); setError('');
    try {
      const res=await fetch('https://amava-backend-production.up.railway.app/revcalall',{method:'POST'});
      if(!res.ok){const e=await res.json();throw new Error(e.error||'Failed.');}
      const data=await res.json();
      if(data.status==='success') setAllResults(data.data||[]);
      else setError(data.message||'Unknown error.');
    } catch(err:any){setError(err.message||'Something went wrong.');}
    finally{setAllLoading(false);}
  };

  const spin: React.CSSProperties = { width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'var(--on-accent)',borderRadius:'50%',display:'inline-block',animation:'auriq-spin .9s linear infinite' };
  const canGo = !loading && !!asin && !!cost;

  return (
    <div style={{maxWidth:940,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'var(--gap)',alignItems:'start'}}>
      <div style={{...card,padding:24,display:'flex',flexDirection:'column',gap:16}}>
        <div>
          <h2 style={{margin:'0 0 4px',fontFamily:'var(--font-display)',fontSize:19,fontWeight:700,color:'var(--text-primary)'}}>FBA profit calculator</h2>
          <p style={{margin:0,fontSize:12.5,color:'var(--text-muted)'}}>Estimate net profit after Amazon fees.</p>
        </div>
        <div><label style={lStyle}>ASIN</label><input type='text' style={iStyle} value={asin} onChange={e=>setAsin(e.target.value)} placeholder='B0XXXXXXXX'/></div>
        <div><label style={lStyle}>Cost price (USD)</label><input type='number' style={iStyle} value={cost} onChange={e=>setCost(e.target.value)} placeholder='0.00'/></div>
        <button onClick={handleCalculate} disabled={!canGo} style={{height:44,borderRadius:12,background:canGo?accent:'var(--surface-inset)',color:canGo?'var(--on-accent)':'var(--text-muted)',border:'none',fontFamily:'var(--font-body)',fontSize:14,fontWeight:600,cursor:canGo?'pointer':'not-allowed',transition:'var(--transition-all)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          {loading ? <span style={spin}/> : <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'><path d='M20 6 9 17l-5-5'/></svg>}
          {loading ? 'Calculating…' : 'Calculate profit'}
        </button>
        <button onClick={CalculateAllCheckedProduct} disabled={allLoading} style={{height:44,borderRadius:12,background:'var(--surface-inset)',color:'var(--text-secondary)',border:'1px solid var(--border-subtle)',fontFamily:'var(--font-body)',fontSize:13.5,fontWeight:500,cursor:'pointer',transition:'var(--transition-all)'}}>
          {allLoading ? 'Calculating all…' : 'Calculate all checked products'}
        </button>
        {error && <div style={{padding:12,borderRadius:10,background:'rgba(255,90,90,.1)',border:'1px solid rgba(255,90,90,.3)',color:'var(--danger-500)',fontSize:13.5}}>{error}</div>}
      </div>

      <div style={{...card,padding:24,boxShadow:result?'0 0 28px rgba(43,217,160,.12)':'none',transition:'box-shadow .4s'}}>
        {result ? (
          <>
            <div style={{fontSize:11,letterSpacing:'.14em',textTransform:'uppercase',color:accent,fontWeight:600}}>Result</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:38,fontWeight:800,color:'var(--success-500)',margin:'10px 0 4px'}}>{'$'+result.profit.toFixed(2)}</div>
            <div style={{fontSize:12.5,color:'var(--text-muted)',marginBottom:20}}>Net profit &middot; {result.cost>0?Math.round((result.profit/result.cost)*100)+'%':'—'} ROI</div>
            {([['ASIN',result.asin,accent],['FBA sale price','$'+result.price.toFixed(2),'var(--text-primary)'],['Amazon fees','-$'+result.fees.toFixed(2),'var(--danger-500)'],['Cost of goods','-$'+result.cost.toFixed(2),'var(--danger-500)']] as [string,string,string][]).map(([l,v,c])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13.5,padding:'10px 0',borderBottom:'1px solid var(--border-subtle)'}}>
                <span style={{color:'var(--text-secondary)'}}>{l}</span>
                <span style={{fontFamily:'var(--font-mono)',color:c,fontWeight:600}}>{v}</span>
              </div>
            ))}
          </>
        ) : (
          <div style={{minHeight:260,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,textAlign:'center'}}>
            <div style={{width:52,height:52,borderRadius:14,background:'var(--surface-inset)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)'}}><svg width='26' height='26' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round'><rect x='5' y='3' width='14' height='18' rx='2.2'/><rect x='8' y='6' width='8' height='3' rx='1'/><path d='M8.5 13h0M12 13h0M15.5 13h0'/></svg></div>
            <div style={{fontSize:13.5,color:'var(--text-muted)',maxWidth:200}}>Enter an ASIN and cost price to see your projected margin.</div>
          </div>
        )}
      </div>

      {allResults.length>0 && (
        <div style={{...card,padding:0,gridColumn:'1/-1'}}>
          <div style={{padding:'16px 22px',borderBottom:'1px solid var(--border-subtle)',display:'flex',alignItems:'center',gap:12}}>
            <h3 style={{margin:0,fontSize:15,fontWeight:600,color:'var(--text-primary)'}}>All checked products</h3>
            <span style={{background:'var(--accent-soft)',color:accent,border:'1px solid var(--border-accent)',borderRadius:99,fontSize:11.5,fontWeight:600,padding:'3px 10px'}}>{allResults.length} items</span>
          </div>
          <div style={{overflowX:'auto'}}><div style={{minWidth:640}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr',gap:12,padding:'12px 22px',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase' as const,color:'var(--text-muted)',fontWeight:600,borderBottom:'1px solid var(--border-subtle)'}}>
              <span>ASIN</span><span>Price</span><span>Fees</span><span>Cost</span><span>Net profit</span>
            </div>
            {allResults.map((item,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr',gap:12,padding:'13px 22px',borderBottom:'1px solid var(--border-subtle)',fontSize:13,alignItems:'center'}}>
                <span style={{fontFamily:'var(--font-mono)',color:accent}}>{item.asin}</span>
                <span style={{fontFamily:'var(--font-mono)',color:'var(--text-primary)'}}>{'$'+item.price.toFixed(2)}</span>
                <span style={{fontFamily:'var(--font-mono)',color:'var(--danger-500)'}}>{'$'+item.fees.toFixed(2)}</span>
                <span style={{fontFamily:'var(--font-mono)',color:'var(--danger-500)'}}>{'$'+item.cost.toFixed(2)}</span>
                <span style={{fontFamily:'var(--font-mono)',color:'var(--success-500)',fontWeight:700}}>{'$'+item.profit.toFixed(2)}</span>
              </div>
            ))}
          </div></div>
        </div>
      )}
    </div>
  );
}