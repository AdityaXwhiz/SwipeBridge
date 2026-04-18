import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

const CARD_STYLES = {
    'Visa': {
        bg: 'linear-gradient(135deg, #0a0a0a 0%, #151826 100%)',
        sheen: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 40%)',
        textColor: '#d4af37', // High-gloss gold
    },
    'Mastercard': {
        bg: 'linear-gradient(135deg, #181924 0%, #080f1c 100%)',
        textColor: '#e0e0e0', // Silver/white
    },
    'American Express': {
        // A complex 5-stop gradient to simulate light hitting a metal surface
        bg: 'linear-gradient(145deg, #d1d5db 0%, #9ca3af 20%, #f3f4f6 50%, #9ca3af 80%, #6b7280 100%)',

        // Add these specific properties to your card style in the JSX:
        isLight: true,
        textColor: 'rgba(0,0,0,0.7)', // Soft black for that "etched" look

        // Use this for the "stamped" text effect in your inline styles:
        textShadow: '0.5px 0.5px 0px rgba(255,255,255,0.5), -0.5px -0.5px 0px rgba(0,0,0,0.2)',

        // Add a subtle metallic sheen overlay
        overlay: 'linear-gradient(to bottom right, rgba(255,255,255,0.2), transparent 60%)',
    },
    'RuPay': {
        bg: 'linear-gradient(135deg, #1f1414 0%, #301010 100%)',
        textColor: '#e0e0e0',
    },
    'Discover': {
        bg: 'linear-gradient(135deg, #2d1810 0%, #1a0f0a 100%)',
        textColor: '#d4af37',
    }
}

export default function SkeuomorphicCard({ card, onDelete }) {
    const ref = useRef(null)

    const x = useMotionValue(0)
    const y = useMotionValue(0)

    // Physics springs for smooth return and interaction
    const mouseXSpring = useSpring(x, { stiffness: 400, damping: 30 })
    const mouseYSpring = useSpring(y, { stiffness: 400, damping: 30 })

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["14deg", "-14deg"])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-14deg", "14deg"])

    // Specular light position tracks mouse
    const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"])
    const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"])

    // Hologram sheen rotation mapping
    const holoDegree = useTransform(mouseXSpring, [-0.5, 0.5], [0, 180])

    const styleConfig = CARD_STYLES[card.network] || CARD_STYLES['Visa']
    const isLight = styleConfig.isLight

    const handleMouseMove = (e) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const xPct = (mouseX / width) - 0.5
        const yPct = (mouseY / height) - 0.5
        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    // Exact stamped/embossed styling requested
    const embossedShadow = isLight
        ? '0 1px 0 rgba(255,255,255,0.7), 0 -1px 0 rgba(0,0,0,0.4)'
        : '0 1px 0 rgba(255,255,255,0.3), 0 -1px 0 rgba(0,0,0,0.8)'

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                perspective: '1200px',
                width: '100%',
                height: 188,
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1
            }}
            whileHover={{ scale: 1.02, zIndex: 10 }}
        >
            <div style={{
                position: 'absolute', inset: 0, borderRadius: 14,
                background: styleConfig.bg,
                border: isLight ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 12px 24px -10px rgba(0,0,0,0.6)',
                overflow: 'hidden', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', padding: '16px 20px'
            }}>

                {/* NOISE OVERLAY - Physical Material Simulation */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: isLight ? 0.4 : 0.15, pointerEvents: 'none', mixBlendMode: 'overlay',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }} />

                {/* FROSTED SHEEN */}
                {styleConfig.sheen && (
                    <div style={{ position: 'absolute', inset: 0, background: styleConfig.sheen, pointerEvents: 'none' }} />
                )}

                {/* NETWORK GRAPHICS (Backdrop layer elements) */}
                {card.network === 'American Express' && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: 140, height: 140, borderRadius: '50%', background: 'rgba(0,0,0,0.02)',
                        border: '1px solid rgba(0,0,0,0.08)', pointerEvents: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {/* Centurion watermark abstraction */}
                        <div style={{ width: 100, height: 100, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 60, height: 60, border: '1px solid rgba(0,0,0,0.06)', transform: 'rotate(45deg)' }} />
                        </div>
                    </div>
                )}

                {/* DYNAMIC SPECULAR GLARE */}
                <motion.div
                    style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        background: useTransform(
                            [glareX, glareY],
                            ([xPos, yPos]) => `radial-gradient(circle at ${xPos} ${yPos}, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)`
                        ),
                        mixBlendMode: isLight ? 'normal' : 'overlay', zIndex: 10
                    }}
                />

                {/* CARD TOP ROW (Logo + Hologram + Delete) */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>

                        {/* NETWORK LOGO (Top Right Text) */}
                        {card.network === 'Visa' && (
                            <div style={{ fontSize: 18, fontWeight: 900, fontStyle: 'italic', color: '#fff', letterSpacing: '-0.05em', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                VISA
                            </div>
                        )}
                        {card.network === 'American Express' && (
                            <div style={{ fontSize: 12, fontWeight: 900, color: '#71717a', border: '1px solid #2a2a2a', padding: '1px 3px', borderRadius: 2, background: 'rgba(255,255,255,0.3)', textShadow: embossedShadow }}>
                                AMEX
                            </div>
                        )}
                        {card.network === 'RuPay' && (
                            <div style={{ fontSize: 16, fontWeight: 900, fontStyle: 'italic', color: '#fff', letterSpacing: '0.05em', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                RuPay
                            </div>
                        )}
                        {card.network === 'Discover' && (
                            <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: '0.05em', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                DISCOVER
                            </div>
                        )}
                        {card.network === 'Mastercard' && (
                            <div style={{ fontSize: 12, fontWeight: 900, fontStyle: 'italic', color: '#fff', letterSpacing: '0.05em', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                MASTERCARD
                            </div>
                        )}



                        {/* DELETE BUTTON */}
                        <div onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            style={{
                                width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '50%', background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                                cursor: 'pointer', zIndex: 20
                            }}
                            title="Remove card">
                            <span style={{ fontSize: 10, color: isLight ? '#444' : '#fff', opacity: 0.8 }}>✕</span>
                        </div>
                    </div>
                </div>

                {/* PHYSICAL EMV CHIP */}
                <div style={{
                    width: 36, height: 26, borderRadius: 5,
                    background: 'linear-gradient(135deg, #e3c472 0%, #c19b38 100%)',
                    boxShadow: isLight ? 'inset 1px 1px 2px rgba(255,255,255,0.8), inset -1px -1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.1)' : 'inset 1px 1px 3px rgba(255,255,255,0.3), inset -1px -1px 3px rgba(0,0,0,0.8), 0 1px 1px rgba(0,0,0,0.5)',
                    position: 'relative', zIndex: 2, overflow: 'hidden', marginTop: 12
                }}>
                    <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.3)', boxShadow: '0 1px 0 rgba(255,255,255,0.3)' }} />
                    <div style={{ position: 'absolute', top: '70%', left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.3)', boxShadow: '0 1px 0 rgba(255,255,255,0.3)' }} />
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '30%', width: 1, background: 'rgba(0,0,0,0.3)', boxShadow: '1px 0 0 rgba(255,255,255,0.3)' }} />
                    <div style={{ position: 'absolute', top: 0, bottom: 0, right: '30%', width: 1, background: 'rgba(0,0,0,0.3)', boxShadow: '1px 0 0 rgba(255,255,255,0.3)' }} />
                    <div style={{ position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', borderRadius: 3, border: '1px solid rgba(0,0,0,0.2)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }} />
                </div>

                {/* CARD BOTTOM ROW (NUMBERS, NAME, EXPIRY) */}
                <div style={{ marginTop: 'auto', position: 'relative', zIndex: 2 }}>
                    <div style={{
                        fontFamily: 'SF Mono, "OCR A Std", "Courier New", monospace',
                        fontSize: 15, letterSpacing: '0.14em',
                        color: styleConfig.textColor, textShadow: embossedShadow,
                        marginBottom: 10
                    }}>
                        •••• •••• •••• {card.lastFour}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 }}>
                        <div style={{
                            fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: 13,
                            color: styleConfig.textColor, textShadow: embossedShadow, textTransform: 'uppercase', letterSpacing: '0.04em',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1
                        }}>
                            {card.cardNickname || card.holderName || "YOUR NAME"}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 6, color: styleConfig.textColor, opacity: 0.7, letterSpacing: '0.15em', marginBottom: 2 }}>VALID THRU</div>
                            <div style={{
                                fontFamily: 'SF Mono, "OCR A Std", "Courier New", monospace', fontSize: 13,
                                color: styleConfig.textColor, textShadow: embossedShadow
                            }}>
                                {card.expiry}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
