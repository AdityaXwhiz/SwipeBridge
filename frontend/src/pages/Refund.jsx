import { motion } from 'framer-motion'
import Footer from '../components/layout/Footer'

export default function Refund() {
  const sections = [
    {
      title: "Eligibility",
      content: "Refunds are only applicable in case of failed transactions where money is deducted but service is not delivered. We ensure 100% protection for failed routing attempts."
    },
    {
      title: "Timeline",
      content: "Eligible refunds will be processed within 5-7 business days to the original source of payment. You will receive a confirmation once the reversal is initiated."
    },
    {
      title: "Process",
      content: "If you encounter a transaction failure, please reach out via our contact page with the transaction ID. Our automated reconciliation system handles most cases instantly."
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingTop: 120, display: 'flex', flexDirection: 'column' }}>
      <div className="ambient-glow" style={{ top: '10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(255,255,255,0.05), transparent)' }} />
      
      <main style={{ flex: 1, padding: '0 36px', maxWidth: 900, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12, fontFamily: 'Outfit,sans-serif' }}>Fairness</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 500, letterSpacing: '-0.02em', fontStyle: 'italic', marginBottom: 48 }}>
            Refund Policy
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