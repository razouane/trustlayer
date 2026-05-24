'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function OrderPublicPage() {
  const { token } = useParams();
  const [order, setOrder] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('view');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [secretCode, setSecretCode] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [payUrl, setPayUrl] = useState('');
  const inputRefs = [];
  const setRef = (i) => (el) => { inputRefs[i] = el; };

  useEffect(() => {
    fetch(`/api/orders/by-token/${token}`)
      .then(r => r.json()).then(d => { setOrder(d.order); setVendor(d.vendor); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const sendOTP = async () => {
    setActionLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/otp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phone: '+216'+phone.replace(/\s/g,'') }) });
      if (!res.ok) throw new Error('Erreur SMS'); setStep('otp');
    } catch(e) { setError(e.message); } finally { setActionLoading(false); }
  };

  const verifyAndPay = async () => {
    const code = otp.join('');
    if (code.length < 6) return setError('Code incomplet');
    setActionLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/otp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phone:'+216'+phone.replace(/\s/g,''), code }) });
      if (!res.ok) throw new Error('Code invalide');
      const payRes = await fetch('/api/payment/initiate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ linkToken: token }) });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error);
      setPayUrl(payData.payUrl); setStep('pay');
    } catch(e) { setError(e.message); } finally { setActionLoading(false); }
  };

  const confirm = async () => {
    if (secretCode.length < 6) return setError('Code requis');
    setActionLoading(true); setError('');
    try {
      const res = await fetch('/api/delivery/confirm', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ orderId: order.id, secretCode, action:'confirm' }) });
      if (!res.ok) throw new Error('Code incorrect');
      setStep('done');
    } catch(e) { setError(e.message); } finally { setActionLoading(false); }
  };

  const pg = { minHeight:'100vh', background:'#070C14', fontFamily:'DM Mono, monospace' };
  const header = { background:'rgba(14,22,34,0.97)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'12px 16px' };
  const logo = { fontSize:18, fontWeight:800, fontFamily:'Syne, sans-serif' };
  const main = { padding:'16px', maxWidth:440, margin:'0 auto' };
  const card = { background:'rgba(14,22,34,1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:16, marginBottom:12 };
  const btn = (off, color='#E8500A') => ({ width:'100%', padding:'12px', background: off ? `${color}30` : color, color: off ? `${color}80` : '#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor: off ? 'not-allowed':'pointer', fontFamily:'DM Mono, monospace', marginTop:8 });

  if (loading) return <div style={{ ...pg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#6B7E99' }}>Chargement...</div>;
  if (!order) return <div style={{ ...pg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}><div style={{ fontSize:48 }}>❌</div><div style={{ color:'#E8F0FF', fontWeight:700 }}>Commande introuvable</div><div style={{ color:'#6B7E99', fontSize:13 }}>Ce lien est invalide ou a expiré.</div></div>;

  return (
    <div style={pg}>
      <div style={header}>
        <div style={logo}><span style={{color:'#E8500A'}}>TRUST</span><span style={{color:'#E8F0FF'}}>LAYER</span></div>
        <div style={{ fontSize:10, color:'#6B7E99', marginTop:2 }}>Commande sécurisée</div>
      </div>
      <div style={main}>
        <div style={{ ...card, textAlign:'center', background: order.status==='delivered' ? 'rgba(15,200,122,0.08)' : 'rgba(232,80,10,0.06)', border:`1px solid ${order.status==='delivered' ? 'rgba(15,200,122,0.3)' : 'rgba(232,80,10,0.2)'}` }}>
          <div style={{ fontSize:12, fontWeight:600, color: order.status==='delivered' ? '#0FC87A' : '#E8500A' }}>
            {{pending:'En attente',confirmed:'Confirmée ✓',in_delivery:'En livraison 🚚',delivered:'Livrée ✓',refused:'Refusée'}[order.status] || order.status}
          </div>
          <div style={{ fontSize:10, color:'#6B7E99', marginTop:4, fontFamily:'DM Mono, monospace' }}>{order.id}</div>
        </div>

        <div style={card}>
          <div style={{ fontSize:10, color:'#6B7E99', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Produit</div>
          <div style={{ fontSize:15, fontWeight:700, color:'#E8F0FF', marginBottom:6 }}>{order.product_name}</div>
          {order.product_desc && <div style={{ fontSize:12, color:'#6B7E99', marginBottom:12, lineHeight:1.6 }}>{order.product_desc}</div>}
          <div style={{ height:1, background:'rgba(255,255,255,0.05)', margin:'10px 0' }} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><div style={{ fontSize:10, color:'#6B7E99', marginBottom:3 }}>Montant total</div><div style={{ fontSize:20, fontWeight:800, color:'#E8F0FF', fontFamily:'Syne, sans-serif' }}>{order.amount} TND</div></div>
            <div><div style={{ fontSize:10, color:'#6B7E99', marginBottom:3 }}>Acompte</div><div style={{ fontSize:20, fontWeight:800, color:'#E8500A', fontFamily:'Syne, sans-serif' }}>{order.deposit} TND</div><div style={{ fontSize:10, color:'#6B7E99' }}>({order.deposit_pct}% maintenant)</div></div>
          </div>
        </div>

        {vendor && (
          <div style={card}>
            <div style={{ fontSize:10, color:'#6B7E99', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Vendeur certifié</div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(232,80,10,0.15)', border:'1.5px solid rgba(232,80,10,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'#E8500A', fontWeight:700 }}>{vendor.shop_name?.[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#E8F0FF' }}>{vendor.shop_name}</div>
                <div style={{ fontSize:11, color:'#6B7E99' }}>{vendor.city} · {vendor.total_orders || 0} commandes</div>
              </div>
              <div style={{ width:38, height:38, borderRadius:'50%', border:`2px solid ${vendor.score>=80?'#0FC87A':vendor.score>=60?'#F5C518':'#F04848'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:vendor.score>=80?'#0FC87A':vendor.score>=60?'#F5C518':'#F04848' }}>{vendor.score}</div>
            </div>
          </div>
        )}

        <div style={{ background:'rgba(15,200,122,0.06)', border:'1px solid rgba(15,200,122,0.2)', borderRadius:10, padding:'12px 14px', marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#0FC87A', marginBottom:6 }}>🛡 Protection TrustLayer</div>
          {['Acompte sécurisé — libéré à la livraison uniquement', 'Produit non conforme ? Remboursement garanti', 'Score vendeur vérifié sur vraies transactions'].map((t,i) => <div key={i} style={{ fontSize:11, color:'#6B7E99', marginBottom:3 }}>✓ {t}</div>)}
        </div>

        {step === 'done' && <div style={{ textAlign:'center', padding:32 }}><div style={{ fontSize:48, marginBottom:12 }}>🎉</div><div style={{ fontSize:16, fontWeight:700, color:'#0FC87A' }}>Livraison confirmée !</div></div>}
        {step === 'view' && order.status === 'pending' && (
          <>
            <button style={btn(false)} onClick={() => setStep('phone')}>Confirmer et payer l'acompte ({order.deposit} TND) →</button>
            <div style={{ fontSize:11, color:'#6B7E99', textAlign:'center', marginTop:6 }}>Paiement sécurisé via Konnect</div>
          </>
        )}
        {step === 'phone' && (
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#E8F0FF', marginBottom:12 }}>Votre numéro de téléphone</div>
            <div style={{ display:'flex', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', padding:'0 12px', color:'#6B7E99', background:'rgba(7,12,20,0.9)', border:'1px solid rgba(255,255,255,0.07)', borderRight:'none', borderRadius:'8px 0 0 8px', fontSize:13 }}>+216</div>
              <input type="tel" placeholder="XX XXX XXX" value={phone} onChange={e => setPhone(e.target.value)} style={{ flex:1, padding:'11px 14px', fontSize:13, color:'#E8F0FF', background:'rgba(7,12,20,0.9)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'0 8px 8px 0', outline:'none', fontFamily:'DM Mono, monospace' }} />
            </div>
            {error && <div style={{ color:'#F04848', fontSize:12, marginBottom:6 }}>{error}</div>}
            <button style={btn(actionLoading)} onClick={sendOTP} disabled={actionLoading}>{actionLoading ? 'Envoi...' : 'Recevoir le code SMS →'}</button>
          </div>
        )}
        {step === 'otp' && (
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#E8F0FF', marginBottom:4, textAlign:'center' }}>Code de vérification</div>
            <div style={{ fontSize:12, color:'#6B7E99', textAlign:'center', marginBottom:4 }}>Envoyé au +216 {phone}</div>
            <div style={{ display:'flex', gap:8, justifyContent:'center', margin:'16px 0' }}>
              {otp.map((d,i) => <input key={i} ref={setRef(i)} maxLength={1} value={d} onChange={e => { const n=[...otp]; n[i]=e.target.value.slice(-1); setOtp(n); if(e.target.value&&i<5) inputRefs[i+1]?.focus(); }} style={{ width:44, height:52, textAlign:'center', fontSize:22, fontWeight:700, background:'rgba(7,12,20,0.9)', border:`1.5px solid ${d?'#E8500A':'rgba(255,255,255,0.1)'}`, borderRadius:8, color:'#E8F0FF', outline:'none' }} />)}
            </div>
            {error && <div style={{ color:'#F04848', fontSize:12, marginBottom:6, textAlign:'center' }}>{error}</div>}
            <button style={btn(actionLoading || otp.join('').length<6)} onClick={verifyAndPay} disabled={actionLoading || otp.join('').length<6}>{actionLoading ? 'Vérification...' : 'Confirmer et payer →'}</button>
          </div>
        )}
        {step === 'pay' && (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>💳</div>
            <div style={{ fontSize:13, fontWeight:600, color:'#E8F0FF', marginBottom:6 }}>Paiement de l'acompte</div>
            <div style={{ fontSize:12, color:'#6B7E99', marginBottom:20 }}>Vous allez être redirigé vers Konnect pour payer {order.deposit} TND.</div>
            <a href={payUrl} style={{ display:'block', textDecoration:'none' }}><button style={btn(false)}>Payer {order.deposit} TND sur Konnect →</button></a>
          </div>
        )}
        {order.status === 'in_delivery' && step !== 'done' && (
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#E8F0FF', marginBottom:6 }}>Confirmer la réception</div>
            <div style={{ fontSize:12, color:'#6B7E99', marginBottom:12 }}>Entrez le code secret à 6 chiffres remis par le livreur.</div>
            <input type="number" placeholder="Code à 6 chiffres" value={secretCode} onChange={e => setSecretCode(e.target.value)} style={{ width:'100%', padding:'14px', textAlign:'center', fontSize:22, fontWeight:700, color:'#E8F0FF', background:'rgba(7,12,20,0.9)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:8, outline:'none', fontFamily:'Syne, sans-serif', boxSizing:'border-box', marginBottom:10 }} />
            {error && <div style={{ color:'#F04848', fontSize:12, marginBottom:6 }}>{error}</div>}
            <button style={btn(actionLoading)} onClick={confirm} disabled={actionLoading}>{actionLoading?'Confirmation...':'✓ Confirmer la livraison'}</button>
            <button style={{ ...btn(false,'#F04848'), marginTop:8, background:'rgba(240,72,72,0.12)', color:'#F04848' }} onClick={() => fetch('/api/delivery/confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:order.id,action:'refuse'})}).then(()=>setStep('refused'))}>Refuser la livraison</button>
          </div>
        )}
      </div>
    </div>
  );
}
