import { useState } from 'react';
import { C } from '../data/defaults';
import { showToast } from '../components/Toast';


export default function SponsorPage({ gigs, setGigs }) {
  const [form, setForm] = useState({ brand:'',type:'',city:'Bangalore',budget:'',notes:'' });
  const [registered, setRegistered] = useState(null);
  const [sponsoring, setSponsoring] = useState(null); // { gigId, amount }

  function registerSponsor() {
    if (!form.brand||!form.type||!form.budget){showToast('Fill required fields',true);return;}
    setRegistered(form);
    showToast('Registered! We\'ll match you to upcoming gigs.');
  }

  function addSponsor(gigId) {
    if (!sponsoring?.amount){showToast('Enter a sponsorship amount',true);return;}
    const updated = gigs.map(g=>g.id===gigId?{...g,sponsors:[...(g.sponsors||[]),{brand:registered?.brand||'Brand',amount:sponsoring.amount}]}:g);
    setGigs(updated);
    setSponsoring(null);
    showToast('Sponsorship added to gig!');
  }

  const categories = [
    {icon:'🍺',l:'BEVERAGES'},{icon:'🎧',l:'AUDIO & TECH'},{icon:'👕',l:'STREETWEAR'},
    {icon:'🖋️',l:'TATTOO STUDIOS'},{icon:'📀',l:'VINYL & GEAR'},{icon:'📰',l:'ZINES & MEDIA'}
  ];

  const openGigs = gigs.filter(g=>(g.slots||[]).length>0);

  return (
    <div className="page">
      <div className="label label-amber" style={{marginBottom:12}}>BRANDS & CULTURAL PARTNERS</div>
      <h2 style={{fontSize:22,fontWeight:500,margin:'0 0 8px'}}>Activate at the right gig.</h2>
      <p style={{fontSize:14,color:'#888',marginBottom:28,lineHeight:1.7}}>From Bira to a Bangalore tattoo studio — if your brand belongs at a live music event, we'll put you exactly there.</p>

      <div className="grid-3" style={{marginBottom:28}}>
        {categories.map(c=>(
          <div key={c.l} className="card" style={{textAlign:'center',padding:'1rem .75rem'}}>
            <div style={{fontSize:20,marginBottom:6}}>{c.icon}</div>
            <div style={{fontWeight:500,fontSize:12,color:C.amber,letterSpacing:.5}}>{c.l}</div>
          </div>
        ))}
      </div>

      <div className="label" style={{marginBottom:14}}>GIGS OPEN FOR SPONSORSHIP</div>
      {openGigs.length===0
        ? <div style={{padding:'1.5rem',textAlign:'center',color:'#ccc',fontSize:13,border:'1px dashed #e8e8e8',borderRadius:10,marginBottom:20}}>No gigs with open slots right now.</div>
        : openGigs.map(g=>(
          <div key={g.id} className="card" style={{marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8,marginBottom:8}}>
              <div>
                <div style={{fontWeight:500,fontSize:14}}>{g.name}</div>
                <div style={{fontSize:12,color:'#888'}}>{g.city} · {g.night} · {g.pay}</div>
              </div>
              <span className="tag tag-amber">{g.genreNeed||'Open genre'}</span>
            </div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:11,color:'#aaa',marginBottom:4}}>OPEN SLOTS</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {(g.slots||[]).map((s,i)=><span key={i} className="tag tag-amber">{s}</span>)}
              </div>
            </div>
            {(g.sponsors||[]).length>0 && (
              <div style={{marginBottom:8}}>
                {g.sponsors.map((s,i)=><span key={i} style={{fontSize:12,color:C.amber,marginRight:8}}>✓ {s.brand} — {s.amount}</span>)}
              </div>
            )}
            {registered && (
              sponsoring?.gigId===g.id
                ? <div style={{display:'flex',gap:8,marginTop:8}}>
                    <input placeholder="Your sponsorship amount (e.g. ₹10,000)" value={sponsoring.amount} onChange={e=>setSponsoring(p=>({...p,amount:e.target.value}))} style={{flex:1}}/>
                    <button className="btn btn-amber btn-sm" onClick={()=>addSponsor(g.id)}>Confirm</button>
                    <button className="btn btn-outline btn-sm" onClick={()=>setSponsoring(null)}>Cancel</button>
                  </div>
                : <button className="btn btn-amber btn-sm" style={{marginTop:8}} onClick={()=>setSponsoring({gigId:g.id,amount:''})}>Sponsor this gig →</button>
            )}
          </div>
        ))
      }

      <div style={{marginTop:20}}>
        {registered ? (
          <div className="card" style={{background:C.amberL,border:`1px solid rgba(186,117,23,.2)`}}>
            <div style={{fontWeight:500,fontSize:15,color:C.amber,marginBottom:4}}>✓ {registered.brand} registered</div>
            <p style={{fontSize:13,color:C.amber,opacity:.8,lineHeight:1.6}}>We'll reach out when a matching gig comes up. You can also sponsor any open gig above.</p>
          </div>
        ) : (
          <div className="card">
            <div className="label label-amber" style={{marginBottom:14}}>REGISTER YOUR BRAND</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <input placeholder="Brand / studio name *" value={form.brand} onChange={e=>setForm(p=>({...p,brand:e.target.value}))}/>
              <div className="grid-2">
                <input placeholder="Type (beverage, tattoo...) *" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}/>
                <input placeholder="City" value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))}/>
              </div>
              <input placeholder="Per-event budget range *" value={form.budget} onChange={e=>setForm(p=>({...p,budget:e.target.value}))}/>
              <textarea placeholder="What kind of events / genre / audience do you want to activate at?" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={{minHeight:70}}/>
              <button className="btn btn-amber" onClick={registerSponsor}>Register & get matched</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
