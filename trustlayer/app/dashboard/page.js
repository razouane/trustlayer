'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const NAV = [
  { href:'/dashboard', icon:'⊞', label:'Accueil' },
  { href:'/orders', icon:'◫', label:'Commandes' },
  { href:'/orders/create', icon:'+', label:null, primary:true },
  { href:'/reputation', icon:'◎', label:'Score' },
  { href:'/disputes', icon:'⚖', label:'Litiges' },
];

function Navbar({ active }) {
  const router = useRouter();
  return (
    <nav style={{ position:'fixed', bottom:0, left:0, right:0, background:'rgba(14,22,34,0.97)', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-around', alignItems:'center', padding:'8px 0 12px', zIndex:100 }}>
      {NAV.map(item => {
        const isActive = active === item.href;
        if (item.primary) return (
          <button key={item.href} onClick={() => router.push(item.href)}
            style={{ width:48, height:48, borderRadius:'50%', background:'#E8500A', border:'none', color:'#fff', fontSize:22, fontWeight:700, cursor:'pointer' }}>
            {item.icon}
          </button>
        );
        return (
          <button key={item.href} onClick={() => router.push(item.href)}
            style={{ background:'transparent', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 8px' }}>
            <span style={{ fontSize:18, color: isActive ? '#E8500A' : '#6B7E99' }}>{item.icon}</span>
            <span style={{ fontSize:9, color: isActive ? '#E8500A' : '#6B7E99', fontFamily:'DM Mono, monospace' }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const v = localStorage.getItem('tl_vendor');
    const u = localStorage.getItem('tl_user');
    if (!u) { router.push('/auth/login'); return; }
    if (v) {
      const parsed = JSON.parse(v);
      setVendor(parsed);
      fetch(`/api/orders?vendor_id=${parsed.id}`)
        .then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false); });
    } else { setLoading(false); }
  }, []);

  const score = vendor?.score || 50;
  const scoreColor = score >= 80 ? '#0FC87A' : score >= 60 ? '#F5C518' : '#F04848';
  const badge = vendor?.badge || 'bronze';
  const badgeLabel = { gold:'Or ★★★', silver:'Argent ★★', bronze:'Bronze ★' };
  const STATUS = { pending:{l:'En attente',c:'#F5C518'}, confirmed:{l:'Confirmée',c:'#4C9EFF'}, in_delivery:{l:'En livraison',c:'#E8500A'}, delivered:{l:'Livrée ✓',c:'#0FC87A'}, refused:{l:'Refusée',c:'#F04848'} };

  const pg = { minHeight:'100vh', background:'#070C14', fontFamily:'DM Mono, monospace', paddingBottom:80 };
  const header = { background:'rgba(14,22,34,0.97)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:50 };
  const logo = { fontSize:16, fontWeight:800, fontFamily:'Syne, sans-serif' };
  const main = { padding:'16px', maxWidth:480, margin:'0 auto' };
  const card = { background:'rgba(14,22,34,1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:16, marginBottom:12 };
  const grid2 = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 };
  const statCard = (color) => ({ background:'rgba(14,22,34,1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'14px' });
  const sectionTitle = { fontSize:11, color:'#6B7E99', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 };
  const orderRow = { background:'rgba(14,22,34,1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'12px 14px', marginBottom:8, cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' };

  if (loading) return (
    <div style={{ ...pg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:32, color:'#E8500A', marginBottom:12 }}>◈</div>
        <div style={{ fontSize:13, color:'#6B7E99' }}>Chargement...</div>
      </div>
    </div>
  );

  return (
    <div style={pg}>
      <div style={header}>
        <div style={logo}><span style={{color:'#E8500A'}}>TRUST</span><span style={{color:'#E8F0FF'}}>LAYER</span></div>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(232,80,10,0.15)', border:'1.5px solid rgba(232,80,10,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'#E8500A', fontWeight:700, cursor:'pointer' }}
          onClick={() => router.push('/profile')}>S</div>
      </div>
      <div style={main}>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:20, fontWeight:800, color:'#E8F0FF', fontFamily:'Syne, sans-serif', marginBottom:4 }}>
            Bonjour 👋
          </div>
          <div style={{ fontSize:13, color:'#6B7E99' }}>Voici votre activité</div>
        </div>

        <div style={grid2}>
          <div style={statCard()}>
            <div style={{ fontSize:10, color:'#6B7E99', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Score</div>
            <div style={{ fontSize:24, fontWeight:800, color:scoreColor, fontFamily:'Syne, sans-serif' }}>{score}/100</div>
          </div>
          <div style={statCard()}>
            <div style={{ fontSize:10, color:'#6B7E99', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Badge</div>
            <div style={{ fontSize:16, fontWeight:800, color:'#F5C518', fontFamily:'Syne, sans-serif' }}>{badgeLabel[badge]}</div>
          </div>
          <div style={statCard()}>
            <div style={{ fontSize:10, color:'#6B7E99', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Commandes</div>
            <div style={{ fontSize:24, fontWeight:800, color:'#E8500A', fontFamily:'Syne, sans-serif' }}>{orders.length}</div>
          </div>
          <div style={statCard()}>
            <div style={{ fontSize:10, color:'#6B7E99', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Livrées</div>
            <div style={{ fontSize:24, fontWeight:800, color:'#0FC87A', fontFamily:'Syne, sans-serif' }}>{orders.filter(o=>o.status==='delivered').length}</div>
          </div>
        </div>

        <div style={{ ...card, marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#E8F0FF' }}>Score de réputation</div>
            <div style={{ width:40, height:40, borderRadius:'50%', border:`2px solid ${scoreColor}`, background:`${scoreColor}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:scoreColor }}>{score}</div>
          </div>
          <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:3 }}>
            <div style={{ height:'100%', width:`${score}%`, background:scoreColor, borderRadius:3, transition:'width 1s ease' }} />
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div style={sectionTitle}>Commandes récentes</div>
          <span style={{ fontSize:11, color:'#E8500A', cursor:'pointer' }} onClick={() => router.push('/orders')}>Voir tout →</span>
        </div>

        {orders.slice(0,4).map(o => {
          const st = STATUS[o.status] || { l:o.status, c:'#6B7E99' };
          return (
            <div key={o.id} style={orderRow} onClick={() => router.push(`/orders/${o.id}`)}>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:'#E8F0FF', marginBottom:2 }}>{o.product_name}</div>
                <div style={{ fontSize:10, color:'#6B7E99' }}>{o.id}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background:`${st.c}15`, color:st.c, marginBottom:4 }}>{st.l}</div>
                <div style={{ fontSize:12, fontWeight:700, color:'#E8F0FF' }}>{o.amount} TND</div>
              </div>
            </div>
          );
        })}

        {!orders.length && (
          <div style={{ ...card, textAlign:'center', padding:32 }}>
            <div style={{ fontSize:32, marginBottom:10 }}>📦</div>
            <div style={{ fontSize:13, color:'#6B7E99', marginBottom:12 }}>Aucune commande pour l'instant</div>
            <button onClick={() => router.push('/orders/create')}
              style={{ background:'#E8500A', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontSize:12, cursor:'pointer', fontFamily:'DM Mono, monospace' }}>
              Créer ma première commande →
            </button>
          </div>
        )}
      </div>
      <Navbar active="/dashboard" />
    </div>
  );
}
