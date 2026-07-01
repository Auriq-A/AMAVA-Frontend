import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
const card: React.CSSProperties = { background:'var(--surface-card)', border:'1px solid var(--border-subtle)', borderRadius:16, backdropFilter:'blur(12px)' };

export default function ScreenshotListener() {
  const { accent } = useApp();
  const [imgSrc,setImgSrc]=useState<string|null>(null);
  const [frameCount,setFrameCount]=useState(0);

  useEffect(()=>{
    let interval: ReturnType<typeof setInterval>;
    const fetchScreenshot = async () => {
      try {
        const res=await fetch('https://api-amava.up.railway.app/get-screenshot',{method:'GET',headers:{'ngrok-skip-browser-warning':'true'}});
        if(res.ok){
          const blob=await res.blob();
          if(blob.type.startsWith('image/')){
            setImgSrc(prev=>{if(prev)URL.revokeObjectURL(prev);return URL.createObjectURL(blob);});
            setFrameCount(n=>n+1);
          }
        }
      } catch { setImgSrc(null); }
    };
    fetchScreenshot();
    interval=setInterval(fetchScreenshot,200);
    return ()=>clearInterval(interval);
  },[]);

  return (
    <div style={{maxWidth:1100,margin:'0 auto',display:'flex',flexDirection:'column',gap:'var(--gap)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:99,background:'rgba(43,217,160,.15)',border:'1px solid rgba(43,217,160,.3)',fontSize:12.5,fontWeight:600,color:'var(--success-500)'}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:'var(--success-500)',animation:'auriq-pulse 1.4s ease-in-out infinite'}}/>
          {imgSrc?'Agent active — frame '+frameCount:'Waiting for agent…'}
        </span>
      </div>

      <div style={{...card,padding:14}}>
        <div style={{borderRadius:12,overflow:'hidden',border:'1px solid var(--border-subtle)',background:'var(--bg-sunken)'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:'var(--surface-card)',borderBottom:'1px solid var(--border-subtle)'}}>
            <span style={{width:11,height:11,borderRadius:'50%',background:'#FF5A5A'}}/>
            <span style={{width:11,height:11,borderRadius:'50%',background:'#F5A623'}}/>
            <span style={{width:11,height:11,borderRadius:'50%',background:'var(--success-500)'}}/>
            <span style={{marginLeft:10,fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-muted)'}}>live screenshot &middot; 200ms refresh</span>
          </div>
          <div style={{minHeight:480,display:'flex',alignItems:'center',justifyContent:'center',padding:8}}>
            {imgSrc ? (
              <img src={imgSrc} alt='Live Screenshot' style={{maxWidth:'100%',maxHeight:'70vh',borderRadius:8,display:'block'}}/>
            ) : (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,color:'var(--text-muted)'}}>
                <span style={{width:44,height:44,border:'3px solid var(--border-subtle)',borderTopColor:accent,borderRadius:'50%',display:'inline-block',animation:'auriq-spin .9s linear infinite'}}/>
                <div style={{fontSize:13.5}}>Waiting for screenshot from agent…</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:12}}>Frame refreshes every 200ms</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}