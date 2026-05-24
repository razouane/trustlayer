'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const u = localStorage.getItem('tl_user');
    if (!u) { router.push('/auth/login'); return; }
    const parsed = JSON.parse(u);
    setUserId(parsed.id);
    fetch(`/api/disputes?user_id=${parsed.id}`)
      .then(r => r.json()).then(d => { setDisputes(d.disputes || []); setLoading(false); });
  }, []);

  const STATUS = { open:{l:'Ouvert',c:'#F04848'}, under_review:{l:'En examen',c:'#F5C518'}, resolved:{l:'Résolu',c:'#0FC87A'}, closed:{l:'Fermé',c:'#6B7E99'} };
  const pg = { minHeight:'100vh', background:'#070C14', fontFamily:'DM Mono, monospace', paddingBottom:80 };
  const header = { background:'rgba(14,22,34,0.97)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:50 };
  const main = { padding:'16px', maxWidth:480, margin:'0 auto' };
  const card = (color='rgba(255,255,255,0.07)') => ({ background:'rgba(14,22,34,1)', border:`1px solid ${color}`, borderRadius:12, padding:16, marginBottom:10, cursor:'pointer' });
  const nav = { position:'fixed', bottom:0, left:0, right:0, background:'rgba(14,22,34,0.97)', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-around', alignItems:'center', padding:'8px 0 12px', zIndex:100 };

  const openCount = disputes.filter(d => d.status === 'open').length;

  return (
    <div style={pg}>
      <div style={header}>
        <button onClick={() => router.push('/dashboard')} style={{ background:'transparent', border:'none', color:'#6B7E99', fontSize:18, cursor:'pointer' }}>←</button>
        <div style={{ fontSize:15, fontWeight:700, color:'#E8F0FF', fontFamily:'Syne, sans-serif' }}>Litiges</div>
      </div>
      <div style={main}>
        <div style={{ ...card(openCount > 0 ? 'rgba(240,72,72,0.3)' : 'rgba(15,200,122,0.3)'), background: openCount > 0 ? 'rgba(240,72,72,0.06)' : 'rgba(15,200,122,0.06)', cursor:'default' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:10, color: openCount > 0 ? '#F04848' : '#0FC87A', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Litiges actifs</div>
              <div style={{ fontSize:40, fontWeight:800, fontFamily:'Syne, sans-serif', color: openCount > 0 ? '#F04848' : '#0FC87A' }}>{openCount}</div>
            </div>
            <div style={{ fontSize:36 }}>⚖</div>
          </div>
        </div>

        <div style={{ background:'rgba(15,200,122,0.05)', border:'1px solid rgba(15,200,122,0.2)', borderRadius:10, padding:'12px 14px', marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#0FC87A', marginBottom:8 }}>Comment fonctionne un litige ?</div>
          {['Signalez le problème sur votre commande','Soumettez vos preuves (photos + description)','TrustLayer examine le dossier sous 24h','Remboursement si non-conformité confirmée'].map((s,i) => (
            <div key={i} style={{ display:'flex', gap:8, fontSize:11, color:'#6B7E99', marginBottom:4 }}>
              <span style={{ color:'#0FC87A', fontWeight:700, flexShrink:0 }}>{i+1}.</span><span>{s}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize:10, color:'#6B7E99', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Mes litiges</div>
        {loading ? (
          <div style={{ textAlign:'center', padding:32, color:'#6B7E99' }}>Chargement...</div>
        ) : disputes.length ? disputes.map(d => {
          const st = STATUS[d.status] || { l:d.status, c:'#6B7E99' };
          return (
            <div key={d.id} style={card()} onClick={() => router.push(`/disputes/${d.id}`)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div style={{ flex:1, marginRight:10 }}>
                  <div style={{ fontSize:10, color:'#6B7E99', marginBottom:3 }}>{d.id?.slice(0,8)}... · Commande {d.order_id}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#E8F0FF', lineHeight:1.4 }}>{d.description?.slice(0,60)}...</div>
                </div>
                <span style={{ fontSize:10, padding:'3px 8px', borderRadius:10, background:`${st.c}15`, color:st.c, whiteSpace:'nowrap' }}>{st.l}</span>
              </div>
              <div style={{ height:1, background:'rgba(255,255,255,0.05)', marginBottom:8 }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#6B7E99' }}>
                <span>Produit : {d.orders?.product_name}</span>
                <span>{new Date(d.created_at).toLocaleDateString('fr-TN')}</span>
              </div>
            </div>
          );
        }) : (
          <div style={{ textAlign:'center', padding:40, background:'rgba(14,22,34,1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12 }}>
            <div style={{ fontSize:36, marginBottom:10 }}>✅</div>
            <div style={{ fontSize:13, color:'#6B7E99' }}>Aucun litige pour l'instant</div>
          </div>
        )}
      </div>
      <nav style={nav}>
        {[{h:'/dashboard',i:'⊞',l:'Accueil'},{h:'/orders',i:'◫',l:'Commandes'},{h:'/orders/create',i:'+',primary:true},{h:'/reputation',i:'◎',l:'Score'},{h:'/disputes',i:'⚖',l:'Litiges'}].map(item => (
          item.primary
            ? <button key={item.h} onClick={() => router.push(item.h)} style={{ width:48,height:48,borderRadius:'50%',background:'#E8500A',border:'none',color:'#fff',fontSize:22,fontWeight:700,cursor:'pointer' }}>{item.i}</button>
            : <button key={item.h} onClick={() => router.push(item.h)} style={{ background:'transparent',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2 }}>
                <span style={{ fontSize:18, color:item.h==='/disputes'?'#E8500A':'#6B7E99' }}>{item.i}</span>
                <span style={{ fontSize:9, color:item.h==='/disputes'?'#E8500A':'#6B7E99', fontFamily:'DM Mono, monospace' }}>{item.l}</span>
              </button>
        ))}
      </nav>
    </div>
  );
}
