import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';

type Sale = { id:number; item_price:number; currency:string; product_name:string; amazon_order_id:string; };

const ACTIONS = [
  { path:'/search', title:'Product Search', desc:'Scrape a supplier catalog', color:'#00D4FF' },
  { path:'/scraped', title:'Winning Products', desc:'Review high-margin matches', color:'#9B8CFF' },
  { path:'/ungated', title:'Check Un/Gated', desc:'Verify Amazon eligibility', color:'#2BD9A0' },
  { path:'/fba-profit-calculator', title:'Revenue Calc', desc:'Estimate FBA net profit', color:'#F5A623' },
  { path:'/sales', title:'Sales', desc:"Today's order activity", color:'#4B9DFF' },
  { path:'/sales-performance', title:'Performance', desc:'Revenue & unit trends', color:'#FF6B6B' },
  { path:'/chat', title:'AMAVA Assistant', desc:'Ask the sourcing agent', color:'#00D4FF' },
  { path:'/progress', title:'Scraping Progress', desc:'Watch the agent live', color:'#2BD9A0' },
];

const card: React.CSSProperties = { background:'var(--surface-card)', border:'1px solid var(--border-subtle)', borderRadius:16, padding:20, backdropFilter:'blur(12px)' };

export default function Dashboard() {
  const navigate = useNavigate();
  const { accent } = useApp();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://api-amava.up.railway.app/todays-sales')
      .then(r => { setSales(r.data.sales_data||[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalRevenue = sales.reduce((s,o) => s+o.item_price,0);
  const chartData = [
    {date:'Jun 17',revenue:2940},{date:'Jun 18',revenue:4320},
    {date:'Jun 19',revenue:4010},{date:'Jun 20',revenue:3560},
    {date:'Jun 21',revenue:4820},{date:'Jun 22',revenue:totalRevenue||5100},
  ];

  return (
    <div style={{maxWidth:1280,margin:'0 auto',display:'flex',flexDirection:'column',gap:'var(--gap)'}}>
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
        <div>
          <div style={{fontSize:11.5,letterSpacing:'.16em',textTransform:'uppercase',color:accent,fontWeight:600,marginBottom:6}}>Good morning, Maya</div>
          <h2 style={{margin:0,fontFamily:'var(--font-display)',fontSize:26,fontWeight:700,letterSpacing:'-.02em',color:'var(--text-primary)'}}>Here's your sourcing pipeline today</h2>
        </div>
        <button onClick={() => navigate('/search')} style={{height:44,padding:'0 20px',borderRadius:12,background:accent,color:'var(--on-accent)',border:'none',fontFamily:'var(--font-body)',fontSize:14,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          New scrape
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'var(--gap)'}}>
        {[
          {label:"Today's revenue", value: loading?'—': '$'+totalRevenue.toFixed(2), sub:sales.length+' orders', delta:'↑ 12.4%', dColor:'var(--success-500)'},
          {label:'Units sold', value:loading?'—':String(sales.length), sub:'FBA fulfilled', delta:'↑ 8%', dColor:'var(--success-500)'},
          {label:'Products scanned', value:'1,204', sub:'3 suppliers crawled', delta:'↑ 320', dColor:accent},
          {label:'Win rate', value:'27.6%', sub:'ungated & profitable', delta:'↓ 1.2%', dColor:'var(--danger-500)'},
        ].map((k,i) => (
          <div key={i} style={{...card, boxShadow: i===0?'0 0 24px rgba(0,212,255,.1)':'none'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12.5,color:'var(--text-muted)',fontWeight:500}}>{k.label}</span>
              <span style={{fontFamily:'var(--font-mono)',fontSize:11.5,fontWeight:600,color:k.dColor}}>{k.delta}</span>
            </div>
            <div style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:700,color:'var(--text-primary)',marginTop:12}}>{k.value}</div>
            <div style={{fontSize:11.5,color:'var(--text-muted)',marginTop:4}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1.65fr 1fr',gap:'var(--gap)'}}>
        <div style={card}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div><h3 style={{margin:0,fontSize:15,fontWeight:600,color:'var(--text-primary)'}}>Revenue trend</h3><p style={{margin:'3px 0 0',fontSize:12,color:'var(--text-muted)'}}>Last 7 days · FBA net</p></div>
            <span style={{background:'var(--accent-soft)',color:accent,border:'1px solid var(--border-accent)',borderRadius:99,fontSize:11.5,fontWeight:600,padding:'3px 10px'}}>+18.2%</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity={0.25}/><stop offset="100%" stopColor={accent} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="4 4"/>
              <XAxis dataKey="date" tick={{fill:'var(--text-muted)',fontSize:11,fontFamily:'var(--font-mono)'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'var(--text-muted)',fontSize:11,fontFamily:'var(--font-mono)'}} axisLine={false} tickLine={false} width={48}/>
              <Tooltip contentStyle={{background:'var(--surface-card)',border:'1px solid var(--border-subtle)',borderRadius:10,color:'var(--text-primary)',fontFamily:'var(--font-mono)',fontSize:12}}/>
              <Line type="monotone" dataKey="revenue" stroke={accent} strokeWidth={2.5} dot={{fill:'var(--bg-elevated)',stroke:accent,strokeWidth:2,r:4}} activeDot={{r:6}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={card}>
          <h3 style={{margin:'0 0 16px',fontSize:15,fontWeight:600,color:'var(--text-primary)'}}>Pipeline status</h3>
          {[
            {label:'Scraped',count:'1,204',pct:'100%',color:'var(--text-muted)'},
            {label:'Ungated',count:'742',pct:'62%',color:accent},
            {label:'Profitable',count:'332',pct:'28%',color:'var(--success-500)'},
            {label:'Sourced',count:'88',pct:'7%',color:'var(--warning-500)'},
          ].map(p => (
            <div key={p.label} style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:6}}>
                <span style={{color:'var(--text-secondary)'}}>{p.label}</span>
                <span style={{fontFamily:'var(--font-mono)',color:'var(--text-primary)',fontWeight:600}}>{p.count}</span>
              </div>
              <div style={{height:7,borderRadius:99,background:'var(--surface-inset)',overflow:'hidden'}}>
                <div style={{height:'100%',width:p.pct,borderRadius:99,background:p.color,transition:'width .6s ease'}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{margin:'0 0 14px',fontSize:15,fontWeight:600,color:'var(--text-primary)'}}>Jump back in</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'var(--gap)'}}>
          {ACTIONS.map(a => (
            <button key={a.path} onClick={() => navigate(a.path)} style={{...card,cursor:'pointer',textAlign:'left',border:'1px solid var(--border-subtle)',transition:'var(--transition-all)',padding:18}} onMouseEnter={e=>(e.currentTarget.style.borderColor='var(--border-accent)')} onMouseLeave={e=>(e.currentTarget.style.borderColor='var(--border-subtle)')}>
              <div style={{width:40,height:40,borderRadius:11,background:'var(--accent-soft)',border:'1px solid var(--border-accent)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12,color:a.color,fontSize:20}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.5-4.5"/></svg>
              </div>
              <div style={{fontSize:14,fontWeight:600,color:'var(--text-primary)'}}>{a.title}</div>
              <div style={{fontSize:12,color:'var(--text-muted)',marginTop:4,lineHeight:1.5}}>{a.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}