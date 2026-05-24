'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export default function RiderPage() {
  const { orderId } = useParams();
  const searchParams = useSearchParams();
  const qrToken = searchParams.get('t');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('scan');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/orders/${orderId}`).then(r => r.json()).then(d => { setOrder(d.order); setLoading(false); }).catch(() => setLoading(false));
  }, [orderId]);

  const pickup = async () => {
    setActionLoading(true); setError('');
    try {
      const res = await fetch('/api/delivery/confirm', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ orderId, qrToken, action:'pickup' }) });
      if (!res.ok) throw new Error('QR invalide ou expiré');
      setStep('picked');
    } catch(e) { setError(e.message); } finally { setActionLoading(false); }
  };

  const pg = { minHeight:'100vh', background:'#070C14', fontFamily:'DM Mono, monospace' };
  const header = { background:'rgba(14,22,34,0.97)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'12px 16px' };
  const main = { padding:'16px', maxWidth:440, margin:'0 auto' };
  const card = { background:'rgba(14,22,34,1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:16, marginBottom:12 };
  const btn = (off) => ({ width:'100%', padding:'12px', background: off ? 'rgba(232,80,10,0.2)' : '#E8500A', color: off ? 'rgba(232,80,10,0.5)' : '#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor: off?'not-allowed':'pointer', fontFamily:'DM Mono, monospace', marginTop:8 });

  if (loading) return <div style={{ ...pg, display:'flex', alignItems:'center', justifyContent:'center', color:'#6B7E99', fontSize:13 }}>Chargement...</div>;
  if (!order) return <div style={{ ...pg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}><div style={{fontSize:48}}>❌</div><div style={{color:'#E8F0FF',fontWeight:700}}>QR Code invalide</div><div style={{color:'#6B7E99',fontSize:13}}>Ce QR code est invalide ou a expiré.</div></div>;

  return (
    <div style={pg}>
      <div style={header}>
        <div style={{ fontSize:18, fontWeight:800, fontFamily:'Syne, sans-serif' }}><span style={{color:'#E8500A'}}>TRUST</span><span style={{color:'#E8F0FF'}}>LAYER</span></div>
        <div style={{ fontSize:10, color:'#6B7E99', marginTop:2 }}>Interface Livreur</div>
      </div>
      <div style={main}>
        <div style={card}>
          <div style={{ fontSize:10, color:'#6B7E99', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Commande à livrer</div>
          <div style={{ fontSize:15, fontWeight:700, color:'#E8F0FF', marginBottom:4 }}>{order.product_name}</div>
          <div style={{ fontSize:11, color:'#6B7E99', fontFamily:'DM Mono, monospace', marginBottom:12 }}>{order.id}</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><div style={{ fontSize:10, color:'#6B7E99', marginBottom:3 }}>Montant total</div><div style={{ fontSize:16, fontWeight:700, color:'#E8F0FF' }}>{order.amount} TND</div></div>
            <div><div style={{ fontSize:10, color:'#6B7E99', marginBottom:3 }}>Statut</div><div style={{ fontSize:13, fontWeight:600, color: order.status==='confirmed'?'#F5C518':order.status==='in_delivery'?'#E8500A':'#0FC87A' }}>{order.status==='confirmed'?'Prêt à récupérer':order.status==='in_delivery'?'En livraison':'Livré'}</div></div>
          </div>
        </div>

        {step === 'scan' && order.status === 'confirmed' && (
          <>
            <div style={{ background:'rgba(232,80,10,0.06)', border:'1px solid rgba(232,80,10,0.2)', borderRadius:10, padding:'14px', marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'#E8500A', marginBottom:10 }}>📋 Instructions</div>
              {['Vérifiez que le colis correspond au produit','Récupérez le colis auprès du vendeur','Confirmez la prise en charge ci-dessous','Donnez le code secret au client lors de la livraison'].map((t,i) => (
                <div key={i} style={{ display:'flex', gap:8, fontSize:12, color:'#E8F0FF', marginBottom:6 }}>
                  <span style={{ color:'#E8500A', fontWeight:700, flexShrink:0 }}>{i+1}.</span><span>{t}</span>
                </div>
              ))}
            </div>
            {error && <div style={{ color:'#F04848', fontSize:12, marginBottom:8 }}>{error}</div>}
            <button style={btn(actionLoading)} onClick={pickup} disabled={actionLoading}>{actionLoading?'Confirmation...':'✓ Confirmer la prise en charge'}</button>
          </>
        )}

        {step === 'picked' && (
          <>
            <div style={{ background:'rgba(15,200,122,0.08)', border:'1px solid rgba(15,200,122,0.25)', borderRadius:10, padding:'14px 16px', marginBottom:12, textAlign:'center' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>📦</div>
              <div style={{ fontSize:13, fontWeight:600, color:'#0FC87A', marginBottom:4 }}>Colis récupéré ✓</div>
              <div style={{ fontSize:11, color:'#6B7E99' }}>Procédez à la livraison.</div>
            </div>
            <div style={{ background:'rgba(14,22,34,1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:16, marginBottom:12 }}>
              <div style={{ fontSize:10, color:'#6B7E99', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Code secret à donner au client</div>
              <div style={{ fontSize:40, fontWeight:800, textAlign:'center', letterSpacing:8, color:'#E8500A', fontFamily:'Syne, sans-serif', padding:'10px 0' }}>{order.secret_code}</div>
              <div style={{ fontSize:11, color:'#6B7E99', textAlign:'center' }}>Ce code confirme la livraison</div>
            </div>
          </>
        )}

        {step === 'done' && (
          <div style={{ textAlign:'center', padding:32 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#0FC87A' }}>Mission terminée !</div>
            <div style={{ fontSize:12, color:'#6B7E99', marginTop:8 }}>Votre score a été mis à jour.</div>
          </div>
        )}
      </div>
    </div>
  );
}
