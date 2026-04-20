import { motion } from 'framer-motion'
import Footer from '../components/layout/Footer'

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "Data Collection",
      content: "We collect basic user information such as name, email, and phone number to provide our services and ensure a personalized experience on the Bridge."
    },
    {
      title: "Secure Processing",
      content: "Payments are securely processed via Razorpay. We do not store your card or UPI details. Every transaction is encrypted end-to-end using military-grade AES-256 protocols."
    },
    {
      title: "Third-Party Privacy",
      content: "Your data is not shared with third parties except for payment processing and essential service delivery. We prioritize your financial privacy above all else."
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingTop: 120, display: 'flex', flexDirection: 'column' }}>
      <div className="ambient-glow" style={{ top: '20%', left: '10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(180,79,247,0.1), transparent)' }} />
      
      <main style={{ flex: 1, padding: '0 36px', maxWidth: 900, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ fontSize: 11, color: '#71717a', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12, fontFamily: 'Outfit,sans-serif' }}>Transparency</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 500, letterSpacing: '-0.02em', fontStyle: 'italic', marginBottom: 48 }}>
            Privacy Policy
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