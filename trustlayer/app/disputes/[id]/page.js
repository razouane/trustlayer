'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DisputeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/disputes/${id}`).then(r => r.json()).then(d => { setDispute(d.dispute); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const submitEvidence = async () => {
    if (!desc.trim()) return setError('Description requise');
    setSubmitting(true); setError('');
    try {
      const res = await fetch(`/api/disputes/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status:'under_review', description: desc }) });
      if (!res.ok) throw new Error('Erreur soumission');
      setDispute(p => ({ ...p, status:'under_review' }));
    } catch(e) { setError(e.message); } finally { setSubmitting(false); }
  };

  const STEPS = [{ key:'open', l:'Signalement', d:'Le litige a été ouvert' }, { key:'under_review', l:'Preuves soumises', d:'TrustLayer examine le dossier' }, { key:'resolved', l:'Résolution', d:'Décision finale rendue' }];
  const STATUS = { open:{l:'Ouvert',c:'#F04848'}, under_review:{l:'En examen',c:'#F5C518'}, resolved:{l:'Résolu',c:'#0FC87A'} };
  const currentStep = STEPS.findIndex(s => s.key === dispute?.status);

  const pg = { minHeight:'100vh', background:'#070C14', fontFamily:'DM Mono, monospace', paddingBottom:80 };
  const header = { background:'rgba(14,22,34,0.97)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:50 };
  const main = { padding:'16px', maxWidth:480, margin:'0 auto' };
  const card = { background:'rgba(14,22,34,1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:16, marginBottom:12 };
  const btn = (off) => ({ width:'100%', padding:'12px', background: off?'rgba(232,80,10,0.2)':'#E8500A', color: off?'rgba(232,80,10,0.5)':'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor: off?'not-allowed':'pointer', fontFamily:'DM Mono, monospace', marginTop:8 });
  const inp = { width:'100%', padding:'11px 14px', fontSize:13, color:'#E8F0FF', background:'rgba(7,12,20,0.9)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, outline:'none', fontFamily:'DM Mono, monospace', boxSizing:'border-box', resize:'none' };

  if (loading) return <div style={{ ...pg, display:'flex', alignItems:'center', justifyContent:'center', color:'#6B7E99' }}>Chargement...</div>;
  if (!dispute) return <div style={{ ...pg, display:'flex', alignItems:'center', justifyContent:'center', color:'#6B7E99' }}>Litige introuvable</div>;
  const st = STATUS[dispute.status] || { l:dispute.status, c:'#6B7E99' };

  return (
    <div style={pg}>
      <div style={header}>
        <button onClick={() => router.push('/disputes')} style={{ background:'transparent', border:'none', color:'#6B7E99', fontSize:18, cursor:'pointer' }}>←</button>
        <div style={{ fontSize:15, fontWeight:700, color:'#E8F0FF', fontFamily:'Syne, sans-serif' }}>Litige {dispute.id?.slice(0,8)}...</div>
        <span style={{ marginLeft:'auto', fontSize:10, padding:'3px 8px', borderRadius:10, background:`${st.c}15`, color:st.c }}>{st.l}</span>
      </div>
      <div style={main}>
        <div style={{ fontSize:10, color:'#6B7E99', marginBottom:3 }}>Commande {dispute.order_id}</div>
        <div style={{ fontSize:10, color:'#6B7E99', marginBottom:16 }}>{new Date(dispute.created_at).toLocaleDateString('fr-TN')}</div>

        <div style={{ fontSize:10, color:'#6B7E99', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Progression</div>
        <div style={card}>
          {STEPS.map((step, i) => {
            const done = i <= currentStep;
            const active = i === currentStep;
            return (
              <div key={step.key} style={{ display:'flex', gap:12 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background: done?(active?'rgba(232,80,10,0.2)':'rgba(15,200,122,0.15)'):'rgba(255,255,255,0.06)', border:`1.5px solid ${done?(active?'#E8500A':'#0FC87A'):'rgba(255,255,255,0.1)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color: done?(active?'#E8500A':'#0FC87A'):'#6B7E99', flexShrink:0 }}>
                    {done && !active ? '✓' : i+1}
                  </div>
                  {i < STEPS.length-1 && <div style={{ width:1, height:24, background: done&&i<currentStep?'#0FC87A':'rgba(255,255,255,0.07)', margin:'3px 0' }} />}
                </div>
                <div style={{ paddingBottom:16, flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color: done?'#E8F0FF':'#6B7E99' }}>{step.l}</div>
                  <div style={{ fontSize:11, color:'#6B7E99', marginTop:2 }}>{step.d}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={card}>
          <div style={{ fontSize:10, color:'#6B7E99', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Description</div>
          <div style={{ fontSize:13, color:'#E8F0FF', lineHeight:1.7 }}>{dispute.description || 'Aucune description'}</div>
        </div>

        {dispute.resolution && (
          <div style={{ ...card, background:'rgba(15,200,122,0.06)', border:'1px solid rgba(15,200,122,0.25)' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'#0FC87A', marginBottom:8 }}>✓ Résolution</div>
            <div style={{ fontSize:13, color:'#E8F0FF', lineHeight:1.7 }}>{dispute.resolution}</div>
          </div>
        )}

        {dispute.status === 'open' && (
          <div>
            <div style={{ fontSize:10, color:'#6B7E99', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Soumettre vos preuves</div>
            <div style={{ border:'2px dashed rgba(255,255,255,0.1)', borderRadius:10, padding:20, textAlign:'center', marginBottom:12, cursor:'pointer' }}>
              <div style={{ fontSize:24, marginBottom:6 }}>📸</div>
              <div style={{ fontSize:12, color:'#6B7E99' }}>Ajouter des photos du problème</div>
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:10, color:'#6B7E99', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Description détaillée</div>
              <textarea rows={4} value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="Décrivez le problème en détail..."
                style={{ ...inp, height:100 }} />
            </div>
            {error && <div style={{ color:'#F04848', fontSize:12, marginBottom:6 }}>{error}</div>}
            <button style={btn(submitting)} onClick={submitEvidence} disabled={submitting}>
              {submitting ? 'Soumission...' : 'Soumettre les preuves'}
            </button>
          </div>
        )}

        {dispute.status === 'under_review' && (
          <div style={{ background:'rgba(15,200,122,0.06)', border:'1px solid rgba(15,200,122,0.25)', borderRadius:10, padding:'16px', textAlign:'center' }}>
            <div style={{ fontSize:24, marginBottom:8 }}>🔍</div>
            <div style={{ fontSize:13, fontWeight:600, color:'#0FC87A', marginBottom:6 }}>Preuves soumises ✓</div>
            <div style={{ fontSize:12, color:'#6B7E99', lineHeight:1.6 }}>Notre équipe examine votre dossier. Vous serez notifié dans les 24h.</div>
          </div>
        )}
      </div>
    </div>
  );
}
