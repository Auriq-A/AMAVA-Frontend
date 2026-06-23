import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
type Product = Record<string,any>;
const card: React.CSSProperties = { background:'var(--surface-card)', border:'1px solid var(--border-subtle)', borderRadius:16, backdropFilter:'blur(12px)' };

export default function ScrapedView() {
  const { accent } = useApp();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const skipKeys = ['image','websiteUrl'];

  useEffect(() => {
    fetch('http://localhost:51483/api/get_scraped_data',{method:'GET',headers:{'ngrok-skip-browser-warning':'true'}})
      .then(r=>r.json())
      .then(data=>{
        if(data.status==='success'){
          try { setProducts(JSON.parse(data.raw_string).data); }
          catch { setError('Failed to parse JSON'); }
        } else { setError('Failed to load data from server'); }
        setLoading(false);
      })
      .catch(()=>{ setError('Network error'); setLoading(false); });
  },[]);

  return (
    <div style={{maxWidth:1280,margin:'0 auto',display:'flex',flexDirection:'column',gap:'var(--gap)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <h2 style={{margin:0,fontFamily:'var(--font-display)',fontSize:20,fontWeight:700,color:'var(--text-primary)'}}>Scraped products</h2>
          {!loading && <span style={{background:'var(--accent-soft)',color:accent,border:'1px solid var(--border-accent)',borderRadius:99,fontSize:11.5,fontWeight:600,padding:'3px 10px'}}>{products.length} items</span>}
        </div>
        <button onClick={()=>navigate('/ungated')} style={{height:44,padding:'0 20px',borderRadius:12,background:accent,color:'var(--on-accent)',border:'none',fontFamily:'var(--font-body)',fontSize:14,fontWeight:600,cursor:'pointer'}}>Check on Amazon →</button>
      </div>

      {loading && <div style={{textAlign:'center',padding:60,color:'var(--text-muted)'}}>Loading products…</div>}
      {error && <div style={{padding:16,borderRadius:12,background:'rgba(255,90,90,.1)',border:'1px solid rgba(255,90,90,.3)',color:'var(--danger-500)',fontSize:14}}>{error}</div>}
      {!loading && products.length===0 && !error && <div style={{textAlign:'center',padding:60,color:'var(--text-muted)'}}>No products to show.</div>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'var(--gap)'}}>
        {products.map((product,idx) => (
          <div key={idx} style={{...card,padding:20}}>
            {Object.entries(product).filter(([k,v])=>v&&!skipKeys.includes(k)).map(([k,v])=>(
              <div key={k} style={{marginBottom:8,fontSize:13}}>
                <span style={{fontWeight:600,color:'var(--text-secondary)',marginRight:6}}>{k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}:</span>
                {typeof v==='string'&&v.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)
                  ? <img src={v as string} alt={k} style={{maxWidth:100,maxHeight:100,display:'block',marginTop:6,borderRadius:8}}/>
                  : typeof v==='string'&&v.startsWith('http')
                    ? <a href={v as string} target="_blank" rel="noopener noreferrer" style={{color:accent,textDecoration:'none'}}>View ↗</a>
                    : <span style={{color:'var(--text-primary)'}}>{String(v)}</span>
                }
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}