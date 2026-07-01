import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import { useApp } from '../context/AppContext';
type SalesDay = { interval:string; unitCount:number; orderItemCount:number; orderCount:number; averageUnitPrice:{amount:number;currencyCode:string}; totalSales:{amount:number;currencyCode:string}; };
const card: React.CSSProperties = { background:'var(--surface-card)', border:'1px solid var(--border-subtle)', borderRadius:16, backdropFilter:'blur(12px)' };

export default function SalesMetricsPage() {
  const { accent } = useApp();
  const [metrics,setMetrics]=useState<SalesDay[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [startDate,setStartDate]=useState(new Date(Date.now()-6*86400000));
  const [endDate,setEndDate]=useState(new Date());
  const [period,setPeriod]=useState('30d');
  const spinStyle: React.CSSProperties = { width:20,height:20,border:'2px solid var(--border-subtle)',borderTopColor:accent,borderRadius:'50%',display:'inline-block',animation:'auriq-spin .9s linear infinite' };

  const fetchMetrics = async (from:Date,to:Date) => {
    setLoading(true);
    try {
      const res=await axios.get('https://api-amava.up.railway.app/sales-metrics',{params:{start_date:from.toISOString().split('T')[0],end_date:to.toISOString().split('T')[0]}});
      setMetrics(res.data.data||[]);
    } catch { setError('Failed to fetch sales metrics.'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetchMetrics(startDate,endDate); },[startDate,endDate]);

  const chartData = metrics.map(day=>{ const [start]=day.interval.split('--'); return {date:format(new Date(start),'MMM d'),revenue:day.totalSales.amount,units:day.unitCount}; });
  const totalUnits=metrics.reduce((s,d)=>s+d.unitCount,0);
  const totalRevenue=metrics.reduce((s,d)=>s+d.totalSales.amount,0);
  const currency=metrics[0]?.totalSales?.currencyCode||'USD';

  const kpis = [
    {label:'Total units ('+period+')', value:loading?'—':String(totalUnits), delta:'↑ 14%'},
    {label:'Revenue ('+period+')', value:loading?'—':currency+' '+totalRevenue.toFixed(2), delta:'↑ 18%'},
  ];

  return (
    <div style={{maxWidth:1280,margin:'0 auto',display:'flex',flexDirection:'column',gap:'var(--gap)'}}>
      <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
        <div style={{display:'flex',gap:6,padding:4,borderRadius:10,background:'var(--surface-inset)',border:'1px solid var(--border-subtle)'}}>
          {['7d','30d','90d'].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)} style={{padding:'5px 14px',borderRadius:7,fontSize:12.5,border:'none',background:period===p?'var(--accent-soft)':'transparent',color:period===p?accent:'var(--text-muted)',fontFamily:'var(--font-body)',fontWeight:period===p?600:400,cursor:'pointer',transition:'var(--transition-all)'}}>{p}</button>
          ))}
        </div>
        <div style={{display:'flex',gap:14,alignItems:'flex-end'}}>
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            <span style={{fontSize:11.5,color:'var(--text-muted)',fontWeight:500}}>From</span>
            <DatePicker selected={startDate} onChange={(d)=>d&&setStartDate(d)} className='auriq-dp'/>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            <span style={{fontSize:11.5,color:'var(--text-muted)',fontWeight:500}}>To</span>
            <DatePicker selected={endDate} onChange={(d)=>d&&setEndDate(d)} className='auriq-dp'/>
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'var(--gap)'}}>
        {kpis.map(s=>(
          <div key={s.label} style={card}>
            <div style={{padding:20}}>
              <div style={{fontSize:12.5,color:'var(--text-muted)'}}>{s.label}</div>
              <div style={{display:'flex',alignItems:'baseline',gap:10,marginTop:8}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:27,fontWeight:700,color:'var(--text-primary)'}}>{s.value}</div>
                <span style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--success-500)',fontWeight:600}}>{s.delta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && <div style={{textAlign:'center',padding:40,color:'var(--text-muted)',display:'flex',alignItems:'center',justifyContent:'center',gap:12}}><span style={spinStyle}/>Loading…</div>}
      {error && <div style={{padding:14,borderRadius:12,background:'rgba(255,90,90,.1)',border:'1px solid rgba(255,90,90,.3)',color:'var(--danger-500)',fontSize:14}}>{error}</div>}

      {chartData.length>0 && (
        <div style={{...card,padding:22}}>
          <h3 style={{margin:'0 0 4px',fontSize:15,fontWeight:600,color:'var(--text-primary)'}}>Revenue trend</h3>
          <p style={{margin:'0 0 16px',fontSize:12,color:'var(--text-muted)'}}>Daily net sales</p>
          <ResponsiveContainer width='100%' height={280}>
            <LineChart data={chartData}>
              <defs><linearGradient id='rg' x1='0' y1='0' x2='0' y2='1'><stop offset='0%' stopColor={accent} stopOpacity={0.22}/><stop offset='100%' stopColor={accent} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid stroke='var(--border-subtle)' strokeDasharray='4 4'/>
              <XAxis dataKey='date' tick={{fill:'var(--text-muted)',fontSize:11,fontFamily:'var(--font-mono)'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'var(--text-muted)',fontSize:11,fontFamily:'var(--font-mono)'}} axisLine={false} tickLine={false} width={52}/>
              <Tooltip contentStyle={{background:'var(--surface-card)',border:'1px solid var(--border-subtle)',borderRadius:10,color:'var(--text-primary)',fontFamily:'var(--font-mono)',fontSize:12}}/>
              <Line type='monotone' dataKey='revenue' stroke={accent} strokeWidth={2.5} dot={{fill:'var(--bg-elevated)',stroke:accent,strokeWidth:2,r:4}} activeDot={{r:6}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {metrics.length>0 && (
        <div style={{...card,padding:0}}>
          <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr 1fr 1fr 1fr',gap:12,padding:'12px 22px',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase' as const,color:'var(--text-muted)',fontWeight:600,borderBottom:'1px solid var(--border-subtle)'}}>
            <span>Date</span><span>Units</span><span>Orders</span><span>Items</span><span>Avg price</span><span>Total sales</span>
          </div>
          {metrics.map((day,i)=>{
            const [start]=day.interval.split('--');
            return (
              <div key={i} style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr 1fr 1fr 1fr',gap:12,padding:'13px 22px',borderBottom:'1px solid var(--border-subtle)',fontSize:13,alignItems:'center'}}>
                <span style={{color:'var(--text-primary)',fontWeight:500}}>{new Date(start).toLocaleDateString()}</span>
                <span style={{fontFamily:'var(--font-mono)',color:'var(--text-primary)'}}>{day.unitCount}</span>
                <span style={{fontFamily:'var(--font-mono)',color:'var(--text-secondary)'}}>{day.orderCount}</span>
                <span style={{fontFamily:'var(--font-mono)',color:'var(--text-secondary)'}}>{day.orderItemCount}</span>
                <span style={{fontFamily:'var(--font-mono)',color:'var(--text-primary)'}}>{day.averageUnitPrice.currencyCode} {day.averageUnitPrice.amount.toFixed(2)}</span>
                <span style={{fontFamily:'var(--font-mono)',color:'var(--success-500)',fontWeight:600}}>{day.totalSales.currencyCode} {day.totalSales.amount.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}