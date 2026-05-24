'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('tl_user');
    if (!u) { router.push('/auth/login'); return; }
    fetch('/api/vendors').then(r => r.json()).then(d => { setVendors(d.vendors || []); setLoading(false); });
  }, []);

  const filtered = vendors.filter(v =>
    v.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.city?.toLowerCase().includes(search.toLowerCase()) ||
    v.category?.toLowerCase().includes(search.toLowerCase())
  );

  const BADGE = { gold:{l:'Or ★★★',c:'#F5C518'}, silver:{l:'Argent ★★',c:'#C0C8D8'}, bronze:{l:'Bronze ★',c:'#CD7F32'} };
  const pg = { minHeight:'100vh', background:'#070C14', fontFamily:'DM Mono, monospace', paddingBottom:80 };
  const header = { background:'rgba(14,22,34,0.97)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:50 };
  const main = { padding:'16px', maxWidth:480, margin:'0 auto' };
  const nav = { position:'fixed', bottom:0, left:0, right:0, background:'rgba(14,22,34,0.97)', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-around', alignItems:'center', padding:'8px 0 12px', zIndex:100 };

  return (
    <div style={pg}>
      <div style={header}>
        <button onClick={() => router.push('/dashboard')} style={{ background:'transparent', border:'none', color:'#6B7E99', fontSize:18, cursor:'pointer' }}>←</button>
        <div style={{ fontSize:15, fontWeight:700, color:'#E8F0FF', fontFamily:'Syne, sans-serif' }}>Vendeurs certifiés</div>
      </div>
      <div style={main}>
        <input placeholder="Rechercher un vendeur, ville, catégorie..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width:'100%', padding:'11px 14px', fontSize:13, color:'#E8F0FF', background:'rgba(14,22,34,1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, outline:'none', fontFamily:'DM Mono, monospace', marginBottom:16, boxSizing:'border-box' }} />
        <div style={{ fontSize:10, color:'#6B7E99', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>{filtered.length} vendeurs vérifiés</div>
        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#6B7E99' }}>Chargement...</div>
        ) : filtered.map(v => {
          const b = BADGE[v.badge] || BADGE.bronze;
          const sc = v.score >= 80 ? '#0FC87A' : v.score >= 60 ? '#F5C518' : '#F04848';
          return (
            <div key={v.id} style={{ background:'rgba(14,22,34,1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:16, marginBottom:10 }}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:`${b.c}18`, border:`1.5px solid ${b.c}50`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:b.c, fontWeight:700, flexShrink:0 }}>
                  {v.shop_name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#E8F0FF' }}>{v.shop_name}</div>
                      <div style={{ fontSize:11, color:'#6B7E99', marginTop:2 }}>{v.users?.name} · {v.city}</div>
                    </div>
                    <div style={{ width:38, height:38, borderRadius:'50%', border:`2px solid ${sc}`, background:`${sc}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:sc, flexShrink:0 }}>{v.score}</div>
                  </div>
                  <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
                    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background:`${b.c}18`, color:b.c }}>{b.l}</span>
                    {v.category && <span style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background:'rgba(255,255,255,0.06)', color:'#6B7E99' }}>{v.category}</span>}
                  </div>
                </div>
              </div>
              <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, marginBottom:12 }}>
                <div style={{ height:'100%', width:`${v.score}%`, background:sc, borderRadius:2 }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontSize:11, color:'#6B7E99' }}>{v.total_orders || 0} commandes</div>
                <button onClick={() => router.push('/orders/create')}
                  style={{ fontSize:11, padding:'6px 14px', background:'rgba(232,80,10,0.12)', border:'1px solid rgba(232,80,10,0.3)', borderRadius:8, color:'#E8500A', cursor:'pointer', fontFamily:'DM Mono, monospace' }}>
                  Commander →
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <nav style={nav}>
        {[{h:'/dashboard',i:'⊞',l:'Accueil'},{h:'/orders',i:'◫',l:'Commandes'},{h:'/orders/create',i:'+',primary:true},{h:'/reputation',i:'◎',l:'Score'},{h:'/disputes',i:'⚖',l:'Litiges'}].map(item => (
          item.primary
            ? <button key={item.h} onClick={() => router.push(item.h)} style={{ width:48,height:48,borderRadius:'50%',background:'#E8500A',border:'none',color:'#fff',fontSize:22,fontWeight:700,cursor:'pointer' }}>{item.i}</button>
            : <button key={item.h} onClick={() => router.push(item.h)} style={{ background:'transparent',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2 }}>
                <span style={{ fontSize:18, color:'#6B7E99' }}>{item.i}</span>
                <span style={{ fontSize:9, color:'#6B7E99', fontFamily:'DM Mono, monospace' }}>{item.l}</span>
              </button>
        ))}
      </nav>
    </div>
  );
}
