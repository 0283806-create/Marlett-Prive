import { useState } from 'react';
import { motion } from 'framer-motion';

const LINES = [
  { text: 'Un espacio pensado para momentos que no se olvidan.', align: 'left' },
  { text: 'Diseño, luz y atención al detalle — en cada rincón.', align: 'right' },
  { text: 'Hasta 200 invitados. Una sola historia a la vez.', align: 'left' },
  { text: 'Zapotlanejo, Jalisco. A minutos de Guadalajara.', align: 'right' },
];

function ModoA() {
  return (
    <section style={{ position:'relative', minHeight:'100vh', background:'#080b09', overflow:'hidden', display:'flex', alignItems:'center' }}>
      <div aria-hidden style={{ position:'absolute', inset:'-10% 0', backgroundImage:'url(/sketchmarlett.png)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.13, filter:'invert(1) contrast(0.85)', mixBlendMode:'screen', pointerEvents:'none' }} />
      <div aria-hidden style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, #080b09 0%, transparent 20%, transparent 80%, #080b09 100%)', pointerEvents:'none' }} />
      <div style={{ position:'relative', zIndex:2, maxWidth:860, margin:'0 auto', padding:'120px 40px', display:'flex', flexDirection:'column', gap:64 }}>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.9 }} style={{ textAlign:'center' }}>
          <span style={{ fontFamily:'Manrope,sans-serif', fontSize:'0.6875rem', fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#c9b896' }}>Marlett Privé</span>
        </motion.div>
        {LINES.map((line, i) => (
          <motion.div key={i} initial={{ opacity:0, x: line.align==='left' ? -60 : 60, filter:'blur(6px)' }} animate={{ opacity:1, x:0, filter:'blur(0px)' }} transition={{ delay: i*0.6, duration:1.8, ease:[0.16,1,0.3,1] }} style={{ alignSelf: line.align==='left' ? 'flex-start' : 'flex-end', maxWidth:640, textAlign: line.align as 'left'|'right' }}>
            <p style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(1.4rem,2.8vw,2.1rem)', fontWeight:400, fontStyle:'italic', color:'var(--text,#f2f6f1)', margin:0, lineHeight:1.35 }}>{line.text}</p>
          </motion.div>
        ))}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:2.8, duration:1 }} style={{ textAlign:'center' }}>
          <a href="#resForm" style={{ fontFamily:'Manrope,sans-serif', fontSize:'0.8125rem', fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'#c9b896', textDecoration:'none', borderBottom:'1px solid rgba(201,184,150,0.4)', paddingBottom:3 }}>Agenda tu evento →</a>
        </motion.div>
      </div>
    </section>
  );
}

function ModoB() {
  return (
    <section style={{ position:'relative', minHeight:'100vh', backgroundImage:'url(/sketchmarlett.png)', backgroundSize:'cover', backgroundPosition:'center', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div aria-hidden style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 100%)', pointerEvents:'none' }} />
      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:1.2 }} style={{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', gap:24, textAlign:'center', background:'rgba(8,11,9,0.45)', backdropFilter:'blur(4px)', borderRadius:16, padding:'clamp(24px,4vw,48px) clamp(20px,5vw,60px)' }}>
        <img src="/marlett_clean.png" alt="Marlett" style={{ height:60, width:'auto' }} />
        <em style={{ fontFamily:'"Playfair Display",serif', fontStyle:'italic', color:'#c9a84c', fontSize:'1.5rem', fontWeight:300 }}>Privé</em>
        <p style={{ fontFamily:'"Playfair Display",serif', fontSize:'clamp(1.4rem,2.8vw,2.1rem)', fontStyle:'italic', color:'#f2f6f1', margin:0, lineHeight:1.35 }}>Un espacio pensado para momentos que no se olvidan</p>
        <span style={{ fontSize:'0.75rem', letterSpacing:'0.2em', color:'#c9a84c', textTransform:'uppercase' }}>Zapotlanejo · Jalisco</span>
        <a href="#resForm" style={{ marginTop:8, padding:'14px 36px', borderRadius:9999, background:'linear-gradient(180deg,#3ca671 0%,#2f8f5e 100%)', color:'#fff', fontWeight:600, fontSize:'1rem', textDecoration:'none' }}>Solicitar disponibilidad</a>
      </motion.div>
    </section>
  );
}

export default function Hero() {
  const [modeA] = useState(() => Math.random() > 0.5);
  if (modeA) return <ModoA />;
  return <ModoB />;
}
