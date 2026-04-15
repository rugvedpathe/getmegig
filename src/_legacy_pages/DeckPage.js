import { useState } from 'react';
import { DECK, C } from '../data/defaults';

function SlideContent({ sl }) {
  if (sl.points) return (
    <>
      <h2 style={{fontSize:'clamp(22px,4vw,36px)',fontWeight:500,color:sl.accent,margin:'0 0 22px',whiteSpace:'pre-line'}}>{sl.title}</h2>
      <ul style={{listStyle:'none',padding:0}}>
        {sl.points.map((p,i)=>(
          <li key={i} style={{display:'flex',gap:10,marginBottom:12,alignItems:'flex-start'}}>
            <span style={{color:sl.accent,flexShrink:0,marginTop:2}}>→</span>
            <span style={{fontSize:'clamp(13px,2vw,16px)',color:sl.accent,lineHeight:1.7,opacity:.85}}>{p}</span>
          </li>
        ))}
      </ul>
    </>
  );
  if (sl.parties) return (
    <>
      <h2 style={{fontSize:'clamp(22px,4vw,36px)',fontWeight:500,color:sl.accent,margin:'0 0 22px',whiteSpace:'pre-line'}}>{sl.title}</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {sl.parties.map((p,i)=>(
          <div key={i} style={{background:`${sl.accent}10`,borderRadius:10,padding:'1rem',border:`1px solid ${sl.accent}20`}}>
            <div style={{fontSize:24,marginBottom:6}}>{p.icon}</div>
            <div style={{fontSize:13,fontWeight:500,color:sl.accent,marginBottom:4}}>{p.l}</div>
            <div style={{fontSize:12,color:sl.accent,opacity:.7,lineHeight:1.6}}>{p.d}</div>
          </div>
        ))}
      </div>
    </>
  );
  if (sl.stats) return (
    <>
      <h2 style={{fontSize:'clamp(22px,4vw,36px)',fontWeight:500,color:sl.accent,margin:'0 0 22px'}}>{sl.title}</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {sl.stats.map((s,i)=>(
          <div key={i} style={{background:`${sl.accent}18`,borderRadius:10,padding:'1.25rem',border:`1px solid ${sl.accent}22`}}>
            <div style={{fontSize:28,fontWeight:500,color:sl.accent}}>{s.n}</div>
            <div style={{fontSize:12,color:sl.accent,opacity:.6,marginTop:6}}>{s.l}</div>
          </div>
        ))}
      </div>
    </>
  );
  if (sl.revenue) return (
    <>
      <h2 style={{fontSize:'clamp(22px,4vw,36px)',fontWeight:500,color:sl.accent,margin:'0 0 22px'}}>{sl.title}</h2>
      {sl.revenue.map((r,i)=>(
        <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 14px',background:`${sl.accent}0d`,borderRadius:8,marginBottom:8,border:`1px solid ${sl.accent}15`}}>
          <div>
            <div style={{fontWeight:500,fontSize:14,color:sl.accent}}>{r.s}</div>
            <div style={{fontSize:12,color:sl.accent,opacity:.6}}>{r.d}</div>
          </div>
          <span style={{fontSize:11,padding:'2px 10px',borderRadius:12,background:`${sl.accent}15`,color:sl.accent}}>{r.w}</span>
        </div>
      ))}
    </>
  );
  if (sl.quote) return (
    <div style={{textAlign:'center'}}>
      <h2 style={{fontSize:'clamp(22px,4vw,34px)',fontWeight:500,color:sl.accent,whiteSpace:'pre-line',margin:'0 0 20px',lineHeight:1.2}}>{sl.title}</h2>
      <p style={{fontSize:'clamp(15px,2.5vw,20px)',fontStyle:'italic',color:sl.accent,whiteSpace:'pre-line',margin:'0 0 20px',lineHeight:1.5,opacity:.85}}>"{sl.quote}"</p>
      <p style={{fontSize:13,color:sl.accent,opacity:.55,lineHeight:1.8,maxWidth:440,margin:'0 auto'}}>{sl.body}</p>
    </div>
  );
  if (sl.ask) return (
    <>
      <h2 style={{fontSize:'clamp(22px,4vw,36px)',fontWeight:500,color:sl.accent,whiteSpace:'pre-line',margin:'0 0 24px',lineHeight:1.2}}>{sl.title}</h2>
      {sl.ask.map((a,i)=>(
        <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:`1px solid ${sl.accent}15`}}>
          <span style={{fontSize:13,color:sl.accent,opacity:.5}}>{a.l}</span>
          <span style={{fontSize:13,fontWeight:500,color:sl.accent}}>{a.v}</span>
        </div>
      ))}
    </>
  );
  if (sl.contact) return (
    <div style={{textAlign:'center'}}>
      <h2 style={{fontSize:'clamp(28px,6vw,52px)',fontWeight:400,color:sl.accent,whiteSpace:'pre-line',margin:'0 0 16px',lineHeight:1.15,letterSpacing:-1}}>{sl.title}</h2>
      <p style={{fontSize:16,color:sl.accent,opacity:.7,marginBottom:8}}>{sl.sub}</p>
      <p style={{fontSize:13,color:sl.accent,opacity:.5,marginBottom:24}}>{sl.contact}</p>
    </div>
  );
  // Default: title + sub + tag
  return (
    <div style={{textAlign:'center'}}>
      <h2 style={{fontSize:'clamp(28px,6vw,56px)',fontWeight:400,color:sl.accent,whiteSpace:'pre-line',margin:'0 0 16px',lineHeight:1.1,letterSpacing:-1}}>{sl.title}</h2>
      {sl.sub && <p style={{fontSize:'clamp(14px,2vw,18px)',color:sl.accent,opacity:.65,margin:'0 0 12px'}}>{sl.sub}</p>}
      {sl.tag && <span style={{fontSize:11,padding:'3px 12px',borderRadius:20,border:`1px solid ${sl.accent}40`,color:sl.accent,opacity:.55}}>{sl.tag}</span>}
    </div>
  );
}

export default function DeckPage() {
  const [idx, setIdx] = useState(0);
  const sl = DECK[idx];
  return (
    <div className="page">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div className="label">{idx+1} / {DECK.length}</div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-outline" style={{padding:'7px 18px',fontSize:12}} onClick={()=>idx>0&&setIdx(idx-1)} disabled={idx===0}>← Prev</button>
          <button className="btn btn-outline" style={{padding:'7px 18px',fontSize:12}} onClick={()=>idx<DECK.length-1&&setIdx(idx+1)} disabled={idx===DECK.length-1}>Next →</button>
        </div>
      </div>
      <div style={{background:sl.bg,border:`1px solid ${sl.accent}22`,borderRadius:16,minHeight:380,padding:'2.5rem 2rem',display:'flex',flexDirection:'column',justifyContent:'center',marginBottom:16,position:'relative',overflow:'hidden'}}>
        <SlideContent sl={sl}/>
      </div>
      <div style={{display:'flex',gap:6,justifyContent:'center',flexWrap:'wrap'}}>
        {DECK.map((_,i)=>(
          <button key={i} onClick={()=>setIdx(i)} style={{height:8,width:i===idx?28:8,borderRadius:4,border:'none',cursor:'pointer',padding:0,background:i===idx?C.teal:'#e8e8e8',transition:'width .2s'}}/>
        ))}
      </div>
    </div>
  );
}
