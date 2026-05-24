'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUS = {
  pending:     { l:'En attente',    c:'#F5C518' },
  confirmed:   { l:'Confirmée',     c:'#4C9EFF' },
  in_delivery: { l:'En livraison',  c:'#E8500A' },
  delivered:   { l:'Livrée ✓',      c:'#0FC87A' },
  refused:     { l:'Refusée',       c:'#F04848' },
  disputed:    { l:'En litige',     c:'#F04848' },
};
const FILTERS = ['all','pending','confirmed','in_delivery','delivered','refused'];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const v = localStorage.getItem('tl_vendor');
    if (!v) { router.push('/auth/login'); return; }
    const vendor = JSON.parse(v);
    fetch(`/api/orders?vendor_id=${vendor.id}`)
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setLoading(false); });
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const pg = { minHeight:'100vh', background:'#070C14', fontFamily:'DM Mono, monospace', paddingBottom:80 };
  const header = { background:'rgba(14,22,34,0.97)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:50 };
  const main = { padding:'16px', maxWidth:480, margin:'0 auto' };
  const filterRow = { display:'flex', gap:6, overflowX:'auto', paddingBottom:4, marginBottom:16 };
  const orderCard = { background:'rgba(14,22,34,1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'14px', marginBottom:10, cursor:'pointer' };
  const nav = { position:'fixed', bottom:0, left:0, right:0, background:'rgba(14,22,34,0.97)', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-around', alignItems:'center', padding:'8px 0 12px', zIndex:100 };

  return (
    <div style={pg}>
      <div style={header}>
        <button onClick={() => router.push('/dashboard')} style={{ background:'transparent', border:'none', color:'#6B7E99', fontSize:18, cursor:'pointer' }}>←</button>
        <div style={{ fontSize:15, fontWeight:700, color:'#E8F0FF', fontFamily:'Syne, sans-serif' }}>Mes Commandes</div>
      </div>
      <div style={main}>
        <div style={filterRow}>
          {FILTERS.map(f => {
            const st = STATUS[f];
            const active = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{ whiteSpace:'nowrap', padding:'6px 12px', borderRadius:20, fontSize:11, fontFamily:'DM Mono, monospace', cursor:'pointer', border:`1px solid ${active ? (st?.c || '#E8500A') : 'rgba(255,255,255,0.07)'}`, background: active ? `${st?.c || '#E8500A'}15` : 'transparent', color: active ? (st?.c || '#E8500A') : '#6B7E99' }}>
                {f === 'all' ? 'Toutes' : st?.l}
              </button>
            );
          })}
        </div>
        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'#6B7E99' }}>Chargement...</div>
        ) : filtered.length ? filtered.map(o => {
          const st = STATUS[o.status] || { l:o.status, c:'#6B7E99' };
          return (
            <div key={o.id} style={orderCard} onClick={() => router.push(`/orders/${o.id}`)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#E8F0FF', marginBottom:3 }}>{o.product_name}</div>
                  <div style={{ fontSize:10, color:'#6B7E99' }}>{o.id}</div>
                </div>
                <span style={{ fontSize:10, padding:'3px 9px', borderRadius:10, background:`${st.c}15`, color:st.c }}>{st.l}</span>
              </div>
              <div style={{ height:1, background:'rgba(255,255,255,0.05)', marginBottom:10 }} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, fontSize:11 }}>
                <div><div style={{ color:'#6B7E99', marginBottom:2 }}>Montant</div><div style={{ color:'#E8F0FF', fontWeight:600 }}>{o.amount} TND</div></div>
                <div><div style={{ color:'#6B7E99', marginBottom:2 }}>Acompte</div><div style={{ color:'#E8500A', fontWeight:600 }}>{o.deposit} TND</div></div>
                <div><div style={{ color:'#6B7E99', marginBottom:2 }}>Date</div><div style={{ color:'#E8F0FF' }}>{new Date(o.created_at).toLocaleDateString('fr-TN')}</div></div>
              </div>
            </div>
          );
        }) : (
          <div style={{ textAlign:'center', padding:40, background:'rgba(14,22,34,1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12 }}>
            <div style={{ fontSize:32, marginBottom:10 }}>📦</div>
            <div style={{ fontSize:13, color:'#6B7E99' }}>Aucune commande {filter !== 'all' ? `"${STATUS[filter]?.l}"` : ''}</div>
          </div>
        )}
      </div>
      <nav style={nav}>
        {[{h:'/dashboard',i:'⊞',l:'Accueil'},{h:'/orders',i:'◫',l:'Commandes'},{h:'/orders/create',i:'+',primary:true},{h:'/reputation',i:'◎',l:'Score'},{h:'/disputes',i:'⚖',l:'Litiges'}].map(item => (
          item.primary
            ? <button key={item.h} onClick={() => router.push(item.h)} style={{ width:48, height:48, borderRadius:'50%', background:'#E8500A', border:'none', color:'#fff', fontSize:22, fontWeight:700, cursor:'pointer' }}>{item.i}</button>
            : <button key={item.h} onClick={() => router.push(item.h)} style={{ background:'transparent', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                <span style={{ fontSize:18, color: item.h==='/orders' ? '#E8500A' : '#6B7E99' }}>{item.i}</span>
                <span style={{ fontSize:9, color: item.h==='/orders' ? '#E8500A' : '#6B7E99', fontFamily:'DM Mono, monospace' }}>{item.l}</span>
              </button>
        ))}
      </nav>
    </div>
  );
}
