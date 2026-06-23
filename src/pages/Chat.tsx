import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
const card: React.CSSProperties = { background:'var(--surface-card)', border:'1px solid var(--border-subtle)', borderRadius:16, backdropFilter:'blur(12px)' };

export default function Chat() {
  const { accent } = useApp();
  const [input,setInput]=useState('');
  const [messages,setMessages]=useState<{user:string;text:string}[]>([
    {user:'AMAVA AI',text:"Hi — I'm your sourcing agent. Ask me to scrape a supplier, check gating, or estimate margins."},
  ]);
  const [loading,setLoading]=useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);

  function extractMainResponse(json:any):string {
    for(const e of json){const p=e?.content?.parts?.[0];if(p?.text)return p.text;}
    return 'No main response found.';
  }

  const handleSend = async (e:React.FormEvent) => {
    e.preventDefault();
    if(!input.trim()) return;
    setLoading(true);
    setMessages(msgs=>[...msgs,{user:'You',text:input}]);
    const userId='us',sessionId='st',appName='AMAVAGENT',promptText=input.trim();
    setInput('');
    try {
      let response=await fetch('http://localhost:51483/run',{method:'POST',headers:{'ngrok-skip-browser-warning':'true','Content-Type':'application/json'},body:JSON.stringify({appName,userId,sessionId,newMessage:{role:'user',parts:[{text:promptText}]}})});
      const text=await response.clone().text();
      if(text.includes('"detail":"Session not found"')){
        await fetch('http://localhost:51483/apps/'+appName+'/users/'+userId+'/sessions/'+sessionId,{method:'POST',headers:{'ngrok-skip-browser-warning':'true','Content-Type':'application/json'},body:JSON.stringify({state:{key1:'value1',key2:42}})});
        response=await fetch('http://localhost:51483/run',{method:'POST',headers:{'ngrok-skip-browser-warning':'true','Content-Type':'application/json'},body:JSON.stringify({appName,userId,sessionId,newMessage:{role:'user',parts:[{text:promptText}]}})});
      }
      const retryText=await response.clone().text();
      let main='No main response found.';
      try{const json=JSON.parse(retryText);main=extractMainResponse(json);}catch{main=retryText;}
      setMessages(msgs=>[...msgs,{user:'AMAVA AI',text:main||'No response'}]);
    } catch(error) {
      setMessages(msgs=>[...msgs,{user:'AMAVA AI',text:'Error: '+(error instanceof Error?error.message:String(error))}]);
    } finally { setLoading(false); }
  };

  const isUser = (u:string) => u==='You';

  return (
    <div style={{maxWidth:820,margin:'0 auto',display:'flex',flexDirection:'column',gap:16,height:'calc(100vh - 140px)'}}>
      <div style={{display:'flex',alignItems:'center',gap:11}}>
        <div style={{width:40,height:40,borderRadius:11,background:'linear-gradient(135deg,#00D4FF,#0080CC)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 18px rgba(0,212,255,.35)',flexShrink:0}}>
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#04121F' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='m12 3 2.1 4.7L19 9l-3.5 3.4.9 5.1L12 15l-4.4 2.5.9-5.1L5 9l4.9-1.3L12 3Z'/></svg>
        </div>
        <div>
          <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)'}}>AMAVA Assistant</div>
          <div style={{fontSize:12,color:'var(--success-500)',display:'flex',alignItems:'center',gap:5}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'var(--success-500)',display:'inline-block'}}/>
            Online &middot; sourcing agent
          </div>
        </div>
      </div>

      <div style={{...card,flex:1,overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:14}}>
        {messages.map((msg,idx)=>(
          <div key={idx} style={{display:'flex',justifyContent:isUser(msg.user)?'flex-end':'flex-start'}}>
            <div style={{maxWidth:'78%',padding:'11px 15px',borderRadius:isUser(msg.user)?'14px 14px 4px 14px':'14px 14px 14px 4px',fontSize:13.5,lineHeight:1.55,background:isUser(msg.user)?accent:'var(--surface-inset)',color:isUser(msg.user)?'var(--on-accent)':'var(--text-primary)',border:isUser(msg.user)?'none':'1px solid var(--border-subtle)'}}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display:'flex',justifyContent:'flex-start'}}>
            <div style={{padding:'11px 15px',borderRadius:'14px 14px 14px 4px',background:'var(--surface-inset)',border:'1px solid var(--border-subtle)',display:'flex',gap:5,alignItems:'center'}}>
              {[0,1,2].map(i=>(<span key={i} style={{width:6,height:6,borderRadius:'50%',background:'var(--text-muted)',display:'inline-block',animation:'auriq-pulse 1.2s ease-in-out infinite',animationDelay:i*0.2+'s'}}/>))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <form onSubmit={handleSend} style={{display:'flex',gap:10,alignItems:'center',padding:'8px 8px 8px 18px',borderRadius:14,background:'var(--surface-inset)',border:'1px solid var(--border-subtle)'}}>
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder='Ask about margins, suppliers, gating…' disabled={loading} style={{flex:1,minWidth:0,border:'none',outline:'none',background:'transparent',color:'var(--text-primary)',fontFamily:'var(--font-body)',fontSize:14}}/>
        <button type='submit' disabled={loading||!input.trim()} style={{width:40,height:40,borderRadius:10,background:(!loading&&input.trim())?accent:'var(--surface-card)',color:(!loading&&input.trim())?'var(--on-accent)':'var(--text-muted)',border:'1px solid var(--border-subtle)',cursor:(!loading&&input.trim())?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'var(--transition-all)'}}>
          <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M5 12h14M13 6l6 6-6 6'/></svg>
        </button>
      </form>
    </div>
  );
}