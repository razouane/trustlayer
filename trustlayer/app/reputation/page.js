'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReputationPage() {
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const v = localStorage.getItem('tl_vendor');
    if (!v) { router.push('/auth/login'); return; }
    const parsed = JSON.parse(v); setVendor(parsed);
    fetch(`/api/reputation?user_id=${parsed.user_id}`).then(r => r.json()).then(d => setEvents(d.events || []));
  }, []);

  const score = vendor?.score || 50;
  const sc = score >= 80 ? '#0FC87A' : score >= 60 ? '#F5C518' : '#F04848';
  const badge = vendor?.badge || 'bronze';
  const BADGES = { gold:{ l:'Or ★★★', c:'#F5C518', e:'🥇', min:85 }, silver:{ l:'Argent ★★', c:'#C0C8D8', e:'🥈', min:70 }, bronze:{ l:'Bronze ★', c:'#CD7F32', e:'🥉', min:0 } };

  const pg = { minHeight:'100vh', background:'#070C14', fontFamily:'DM Mono, monospace', paddingBottom:80 };
  const header = { background:'rgba(14,22,34,0.97)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:50 };
  const main = { padding:'16px', maxWidth:480, margin:'0 auto' };
  const card = { background:'rgba(14,22,34,1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:16, marginBottom:12 };
  const nav = { position:'fixed', bottom:0, left:0, right:0, background:'rgba(14,22,34,0.97)', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-around', alignItems:'center', padding:'8px 0 12px', zIndex:100 };

  return (
    <div style={pg}>
      <div style={header}>
        <button onClick={() => router.push('/dashboard')} style={{ background:'transparent', border:'none', color:'#6B7E99', fontSize:18, cursor:'pointer' }}>←</button>
        <div style={{ fontSize:15, fontWeight:700, color:'#E8F0FF', fontFamily:'Syne, sans-serif' }}>Réputation</div>
      </div>
      <div style={main}>
        <div style={{ ...card, background:'linear-gradient(135deg, rgba(14,22,34,1) 0%, rgba(10,16,28,1) 100%)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:10, color:'#6B7E99', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Votre score</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
                <span style={{ fontSize:52, fontWeight:800, fontFamily:'Syne, sans-serif', color:sc }}>{score}</span>
                <span style={{ fontSize:18, color:'#6B7E99' }}>/100</span>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:10, color:'#6B7E99', marginBottom:4 }}>Badge actuel</div>
              <div style={{ fontSize:18, fontWeight:700, color:BADGES[badge].c }}>{BADGES[badge].l}</div>
              <div style={{ fontSize:10, color:'#6B7E99', marginTop:3 }}>{vendor?.total_orders||0} transactions</div>
            </div>
          </div>
          <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:3 }}>
            <div style={{ height:'100%', width:`${score}%`, background:sc, borderRadius:3, transition:'width 1s ease' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, fontSize:10 }}>
            <span style={{ color:'#F04848' }}>0 — Rouge</span>
            <span style={{ color:'#F5C518' }}>70 — Or</span>
            <span style={{ color:'#0FC87A' }}>90 — Platine</span>
          </div>
        </div>

        <div style={{ fontSize:10, color:'#6B7E99', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Badges</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16 }}>
          {Object.entries(BADGES).reverse().map(([key, b]) => (
            <div key={key} style={{ ...card, textAlign:'center', padding:12, marginBottom:0, border:`${badge===key?'1.5px':'1px'} solid ${badge===key?b.c:'rgba(255,255,255,0.07)'}`, background:badge===key?`${b.c}10`:undefined }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{b.e}</div>
              <div style={{ fontSize:10, fontWeight:600, color:b.c }}>{b.l}</div>
              <div style={{ fontSize:9, color:'#6B7E99', marginTop:3 }}>≥ {b.min} pts</div>
              {badge===key && <div style={{ fontSize:9, color:b.c, marginTop:4 }}>● Actuel</div>}
            </div>
          ))}
        </div>

        <div style={{ fontSize:10, color:'#6B7E99', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Historique des événements</div>
        {events.length ? events.map(ev => (
          <div key={ev.id} style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:ev.score_delta>0?'rgba(15,200,122,0.12)':'rgba(240,72,72,0.12)', border:`1px solid ${ev.score_delta>0?'#0FC87A':'#F04848'}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:ev.score_delta>0?'#0FC87A':'#F04848', flexShrink:0 }}>
              {ev.score_delta>0?'↑':'↓'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:'#E8F0FF', marginBottom:2 }}>{ev.reason}</div>
              <div style={{ fontSize:10, color:'#6B7E99' }}>{new Date(ev.created_at).toLocaleDateString('fr-TN')}</div>
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:ev.score_delta>0?'#0FC87A':'#F04848', flexShrink:0 }}>{ev.score_delta>0?'+':''}{ev.score_delta}</div>
          </div>
        )) : <div style={{ textAlign:'center', padding:32, color:'#6B7E99', fontSize:13 }}>Aucun événement pour l'instant</div>}
      </div>
      <nav style={nav}>
        {[{h:'/dashboard',i:'⊞',l:'Accueil'},{h:'/orders',i:'◫',l:'Commandes'},{h:'/orders/create',i:'+',primary:true},{h:'/reputation',i:'◎',l:'Score'},{h:'/disputes',i:'⚖',l:'Litiges'}].map(item => (
          item.primary
            ? <button key={item.h} onClick={() => router.push(item.h)} style={{ width:48,height:48,borderRadius:'50%',background:'#E8500A',border:'none',color:'#fff',fontSize:22,fontWeight:700,cursor:'pointer' }}>{item.i}</button>
            : <button key={item.h} onClick={() => router.push(item.h)} style={{ background:'transparent',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2 }}>
                <span style={{ fontSize:18, color:item.h==='/reputation'?'#E8500A':'#6B7E99' }}>{item.i}</span>
                <span style={{ fontSize:9, color:item.h==='/reputation'?'#E8500A':'#6B7E99', fontFamily:'DM Mono, monospace' }}>{item.l}</span>
              </button>
        ))}
      </nav>
    </div>
  );
}
