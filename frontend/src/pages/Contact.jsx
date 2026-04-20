import { motion } from 'framer-motion'
import Footer from '../components/layout/Footer'
import { ArrowIcon } from '../components/ui/Icons'

export default function Contact() {
  const contactMethods = [
    { label: 'Email Support', value: 'adi9919977332@gmail.com', sub: '24/7 dedicated support' },
    { label: 'Phone', value: '+91-9305700723', sub: 'Mon-Fri, 10AM - 6PM IST' },
    { label: 'Location', value: 'Noida, India', sub: 'Innovation Hub, Sector 62' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingTop: 120, display: 'flex', flexDirection: 'column' }}>
      {/* Ambient Glow */}
      <div className="ambient-glow" style={{ top: '10%', right: '15%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(79,142,247,0.15), transparent)' }} />
      
      <main style={{ flex: 1, padding: '0 36px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12, fontFamily: 'Outfit,sans-serif' }}>Get in touch</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(3rem,8vw,5.5rem)', fontWeight: 500, lineHeight: 1.0, letterSpacing: '-0.02em', fontStyle: 'italic', marginBottom: 60 }}>
            Connect with<br />the Bridge.
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 80 }}>
            {contactMethods.map((method, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                style={{ 
                  background: '#0a0a0a', 
                  border: '1px solid #151515', 
                  borderRadius: 24, 
                  padding: '40px 32px',
                  transition: 'border-color 0.3s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#151515'}
              >
                <div style={{ fontSize: 12, color: '#71717a', fontFamily: 'Outfit,sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>{method.label}</div>
                <div style={{ fontSize: 18, color: '#eee', fontWeight: 600, marginBottom: 8, fontFamily: 'Outfit,sans-serif' }}>{method.value}</div>
                <div style={{ fontSize: 14, color: '#71717a', fontFamily: 'Outfit,sans-serif' }}>{method.sub}</div>
              </motion.div>
            ))}
          </div>

          <div style={{ maxWidth: 600, borderLeft: '1px solid #151515', paddingLeft: 40, marginBottom: 100 }}>
             <p style={{ fontSize: 16, color: '#a1a1aa', lineHeight: 1.7, fontFamily: 'Outfit,sans-serif' }}>
              Have questions about our card routing engine, merchant partnerships, or need assistance with your transactions? Our team is obsessively focused on providing the best payment experience.
             </p>
             <button className="btn-pill" style={{ marginTop: 32 }}>
                Open Support Ticket
                <span className="arrow-circle"><ArrowIcon size={14} color="white" /></span>
             </button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}