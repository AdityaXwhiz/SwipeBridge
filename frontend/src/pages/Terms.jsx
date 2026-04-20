import { motion } from 'framer-motion'
import Footer from '../components/layout/Footer'

export default function Terms() {
  const sections = [
    {
      title: "Usage Agreement",
      content: "By using SwipeBridge, you agree to use the platform only for lawful purposes. You are responsible for maintaining the confidentiality of your account access."
    },
    {
      title: "Limitation of Liability",
      content: "We are not responsible for any discrepancies in third-party offers or bank services. Our role is strictly that of an intermediary proxy for card benefits."
    },
    {
      title: "Service Modifications",
      content: "All offers, fee structures, and card network access are subject to change without prior notice. We reserve the right to modify services to ensure network stability."
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingTop: 120, display: 'flex', flexDirection: 'column' }}>
      <div className="ambient-glow" style={{ top: '30%', right: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(79,142,247,0.1), transparent)' }} />
      
      <main style={{ flex: 1, padding: '0 36px', maxWidth: 900, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12, fontFamily: 'Outfit,sans-serif' }}>Regulations</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 500, letterSpacing: '-0.02em', fontStyle: 'italic', marginBottom: 48 }}>
            Terms & Conditions
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 60, marginBottom: 100 }}>
            {sections.map((section, i) => (
              <div key={i}>
                <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 24, marginBottom: 16, fontWeight: 500 }}>{section.title}</h2>
                <p style={{ fontSize: 16, color: '#a1a1aa', lineHeight: 1.8, fontFamily: 'Outfit,sans-serif', maxWidth: 700 }}>
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}