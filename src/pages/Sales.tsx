import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
type Sale = { id:number; amazon_order_id:string; purchase_date:string; order_status:string; product_name:string; sku:string; asin:string; quantity:number; currency:string; item_price:number; ship_city:string; ship_state:string; ship_postal_code:string; ship_country:string; fulfillment_channel:string; sales_channel:string; ship_service_level:string; };
const card: React.CSSProperties = { background:'var(--surface-card)', border:'1px solid var(--border-subtle)', borderRadius:16, backdropFilter:'blur(12px)' };

export default function SalesTable() {
  const { accent } = useApp();
  const [sales,setSales]=useState<Sale[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>{
    axios.get('https://amava-backend-production.up.railway.app/todays-sales')
      .then(r=>{setSales(r.data.sales_data||[]);setLoading(false);})
      .catch(err=>{setError(err?.response?.data?.message||'Something went wrong.');setLoading(false);});
  },[]);

  const totalRevenue = sales.reduce((s,o)=>s+o.item_price,0);
  const spinStyle: React.CSSProperties = { width:20,height:20,border:'2px solid var(--border-subtle)',borderTopColor:accent,borderRadius:'50%',display:'inline-block',animation:'auriq-spin .9s linear infinite' };

  return (
    <div style={{maxWidth:1280,margin:'0 auto',display:'flex',flexDirection:'column',gap:'var(--gap)'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'var(--gap)'}}>
        {[
          {label:"Today's sales", value: loading?'—':''+totalRevenue.toFixed(2)+' '+(sales[0]?.currency||'USD')},
          {label:'Orders', value:loading?'—':String(sales.length)},
          {label:'Units shipped', value:loading?'—':String(sales.reduce((s,o)=>s+o.quantity,0))},
        ].map((s,i)=>(
          <div key={i} style={card}>
            <div style={{padding:20}}>
              <div style={{fontSize:12.5,color:'var(--text-muted)'}}>{s.label}</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:27,fontWeight:700,color:'var(--text-primary)',marginTop:8}}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {loading && <div style={{textAlign:'center',padding:48,color:'var(--text-muted)',display:'flex',alignItems:'center',justifyContent:'center',gap:12}}><span style={spinStyle}/>Loading sales data…</div>}
      {error && <div style={{padding:14,borderRadius:12,background:'rgba(255,90,90,.1)',border:'1px solid rgba(255,90,90,.3)',color:'var(--danger-500)',fontSize:14}}>{error}</div>}
      {!loading&&!error&&sales.length===0 && <div style={{textAlign:'center',padding:48,color:'var(--text-muted)'}}>No sales found for today.</div>}

      {sales.length>0 && (
        <div style={card}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 22px',borderBottom:'1px solid var(--border-subtle)'}}>
            <h3 style={{margin:0,fontSize:15,fontWeight:600,color:'var(--text-primary)'}}>Today\'s orders</h3>
            <span style={{background:'var(--accent-soft)',color:accent,border:'1px solid var(--border-accent)',borderRadius:99,fontSize:11.5,fontWeight:600,padding:'3px 10px'}}>{sales.length} orders</span>
          </div>
          <div style={{overflowX:'auto'}}>
            <div style={{minWidth:900}}>
              <div style={{display:'grid',gridTemplateColumns:'148px 1.8fr 100px 56px 110px 1fr 1fr',gap:12,padding:'12px 22px',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase' as const,color:'var(--text-muted)',fontWeight:600,borderBottom:'1px solid var(--border-subtle)'}}>
                <span>Order ID</span><span>Product</span><span>ASIN</span><span>Qty</span><span>Price</span><span>Ship to</span><span>Status</span>
              </div>
              {sales.map(o=>(
                <div key={o.id} style={{display:'grid',gridTemplateColumns:'148px 1.8fr 100px 56px 110px 1fr 1fr',gap:12,padding:'14px 22px',borderBottom:'1px solid var(--border-subtle)',alignItems:'center',fontSize:13}}>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:11.5,color:accent}}>{o.amazon_order_id}</span>
                  <span style={{color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.product_name}</span>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-secondary)'}}>{o.asin}</span>
                  <span style={{color:'var(--text-secondary)'}}>{o.quantity}</span>
                  <span style={{fontFamily:'var(--font-mono)',color:'var(--text-primary)',fontWeight:600}}>{o.currency} {o.item_price.toFixed(2)}</span>
                  <span style={{color:'var(--text-muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.ship_city}, {o.ship_state}</span>
                  <span style={{fontSize:12,fontWeight:500,color:'var(--success-500)'}}>{o.order_status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}