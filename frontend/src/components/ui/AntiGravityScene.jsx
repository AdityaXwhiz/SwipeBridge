import React, { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Environment, PerspectiveCamera, Html, RoundedBox, Stars } from '@react-three/drei'
import { EffectComposer, DepthOfField, Vignette } from '@react-three/postprocessing'
import { motion } from 'framer-motion-3d'
import { useScroll, useSpring, useTransform } from 'framer-motion'
import * as THREE from 'three'

/* ── 3D Magnetic Card ── */
function FloatingCard3D({ card, index, randomPos, bentoPos, scrollProgress }) {
    const group = useRef()
    const matRef = useRef()
    const [hovered, setHovered] = useState(false)
    const { pointer, camera } = useThree()

    // Framer motion springs for scroll-to-bento transition
    const springConfig = { stiffness: 100, damping: 20 }

    const posX = useSpring(useTransform(scrollProgress, [0, 1], [randomPos.x, bentoPos.x]), springConfig)
    const posY = useSpring(useTransform(scrollProgress, [0, 1], [randomPos.y, bentoPos.y]), springConfig)
    const posZ = useSpring(useTransform(scrollProgress, [0, 1], [randomPos.z, bentoPos.z]), springConfig)

    const rotX = useSpring(useTransform(scrollProgress, [0, 1], [randomPos.rotX, 0]), springConfig)
    const rotY = useSpring(useTransform(scrollProgress, [0, 1], [randomPos.rotY, 0]), springConfig)
    const rotZ = useSpring(useTransform(scrollProgress, [0, 1], [randomPos.rotZ, 0]), springConfig)

    // Floating physics (y=sin) setup manually or via <Float> wrapping the motion group
    useFrame((state, delta) => {
        if (!group.current) return

        // Magnetic Cursor logic (cards tilt toward mouse if nearby)
        // Convert 2D pointer to 3D roughly
        const vec = new THREE.Vector3(state.pointer.x * 5, state.pointer.y * 5, 0)
        const cardPos = new THREE.Vector3(posX.get(), posY.get(), posZ.get())
        const dist = vec.distanceTo(cardPos)

        // Only apply strong magnetic tilt if we are mostly in "zero-G" mode (scroll progress < 0.5)
        // AND the cursor is nearby
        const activeMagnetic = scrollProgress.get() < 0.5 && dist < 4

        if (activeMagnetic) {
            // Tilt towards cursor
            const targetRotX = (state.pointer.y * 0.5) - (cardPos.y * 0.1)
            const targetRotY = (state.pointer.x * 0.5) - (cardPos.x * 0.1)

            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, 4 * delta)
            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 4 * delta)
        } else {
            // Return to baseline rotation (bento or original drift)
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, 2 * delta)
            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0, 2 * delta)
        }
    })

    // Material setup matching user specific configuration
    const materialProps = {
        transmission: 0.1,    // slight transparency
        clearcoat: 1.0,       // high-gloss finish
        clearcoatRoughness: 0.1,
        roughness: 0.2,
        metalness: 0.8,
        color: card.color,
        envMapIntensity: 1.5,
    }

    // Realistic UI overlay using HTML
    return (
        <motion.group
            position-x={posX}
            position-y={posY}
            position-z={posZ}
            rotation-x={rotX}
            rotation-y={rotY}
            rotation-z={rotZ}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <Float
                speed={hovered ? 0.5 : 2}
                rotationIntensity={scrollProgress.get() > 0.5 ? 0 : 0.4}
                floatIntensity={scrollProgress.get() > 0.5 ? 0 : 1.5}
                floatingRange={[-0.2, 0.2]} // y=sin floating bounding
            >
                <group ref={group}>
                    <RoundedBox args={[3.2, 2.0, 0.05]} radius={0.1} smoothness={4} castShadow receiveShadow>
                        <meshPhysicalMaterial ref={matRef} {...materialProps} />

                        {/* HTML UI Mapped onto the 3D surface */}
                        <Html
                            transform
                            occlude
                            position={[0, 0, 0.026]}
                            style={{
                                width: 320, height: 200,
                                padding: '24px',
                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                color: '#fff', userSelect: 'none',
                                background: 'transparent',
                                // Added a subtle noise mix overlay directly to HTML to augment the CSS part
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: card.accent, background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', backdropFilter: 'blur(4px)' }}>{card.tag}</span>
                                <div style={{ opacity: 0.6 }}>•••</div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <div style={{ fontFamily: '"Courier New", monospace', fontSize: 16, letterSpacing: '0.1em', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                                        •••• •••• {3000 + index * 317}
                                    </div>
                                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '0.05em', opacity: 0.85, textShadow: '0 1px 1px rgba(0,0,0,0.4)', marginTop: 4 }}>{card.name}</div>
                                </div>
                            </div>
                        </Html>

                        {/* Backside overlay */}
                        <Html transform position={[0, 0, -0.026]} rotation={[0, Math.PI, 0]}>
                            <div style={{ width: 320, height: 200, background: 'rgba(0,0,0,0.85)', borderRadius: 16 }}>
                                <div style={{ width: '100%', height: 40, background: '#111', marginTop: 24 }} />
                            </div>
                        </Html>
                    </RoundedBox>
                </group>
            </Float>
        </motion.group>
    )
}

/* ── Scene Point Light Following Mouse ── */
function CursorLight() {
    const lightRef = useRef()
    const { pointer, viewport } = useThree()

    useFrame(() => {
        if (lightRef.current) {
            // Map pointer to 3D space
            const x = (pointer.x * viewport.width) / 2
            const y = (pointer.y * viewport.height) / 2
            // Lerp for smooth lighting pursuit
            lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, x, 0.1)
            lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, y, 0.1)
        }
    })

    return <pointLight ref={lightRef} position={[0, 0, 2]} intensity={20} color="#ffffff" distance={10} decay={2} />
}

/* ── Multi-Layered Parallax Background ── */
function ParallaxBackground({ scrollProgress }) {
    const starsRef = useRef()

    useFrame(() => {
        if (starsRef.current) {
            // Slow constant spin + Parallax shift tied to scroll
            starsRef.current.rotation.y += 0.0005
            starsRef.current.position.y = scrollProgress.get() * 5 // Stars move up as camera pans down implicitly
        }
    })

    return (
        <group ref={starsRef} position={[0, 0, -15]}>
            <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        </group>
    )
}

/* ── Main Export Scene ── */
export default function AntiGravityScene({ cards }) {
    // Use Framer Motion hook to track global window scroll
    const { scrollYProgress } = useScroll()

    // Pre-calculate positions
    const cardData = useMemo(() => {
        return cards.map((card, index) => {
            // Generate randomized Zero-G floating origins
            const randomX = (Math.random() - 0.5) * 12
            const randomY = (Math.random() - 0.5) * 8
            const randomZ = -Math.random() * 5 - 2 // Between -2 and -7

            const rotX = (Math.random() - 0.5) * 1.5
            const rotY = (Math.random() - 0.5) * 1.5
            const rotZ = (Math.random() - 0.5) * 0.5

            // Structured Bento Grid destinations
            // For 6 cards, 3 columns x 2 rows
            const col = index % 3
            const row = Math.floor(index / 3)
            const bentoX = (col - 1) * 3.6
            const bentoY = -(row - 0.5) * 2.5
            const bentoZ = -1.5

            return {
                card, index,
                randomPos: { x: randomX, y: randomY, z: randomZ, rotX, rotY, rotZ },
                bentoPos: { x: bentoX, y: bentoY, z: bentoZ }
            }
        })
    }, [cards])

    return (
        <div style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}>
            {/* pointerEvents: 'none' wrapper with pointerEvents: 'auto' inner allows 3D interactions without blocking normal DOM flow (if needed),
          but we want mouse events here, so let's allow pointerEvents! */}
            <Canvas style={{ pointerEvents: 'auto' }} shadows camera={{ position: [0, 0, 6], fov: 32 }}>

                {/* Environment / Lights */}
                <color attach="background" args={['#050505']} />
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 10, 5]} intensity={1.5} color="#fff" castShadow />
                <directionalLight position={[-5, -10, -5]} intensity={0.5} color="#555" />

                {/* Dynamic Magnetic PointLight */}
                <CursorLight />

                {/* Cinematic Post Processing */}
                <EffectComposer disableNormalPass>
                    <DepthOfField target={[0, 0, -2]} focalLength={0.02} bokehScale={3} height={480} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>

                <ParallaxBackground scrollProgress={scrollYProgress} />

                {/* 3D Cards */}
                {cardData.map((data, i) => (
                    <FloatingCard3D
                        key={i}
                        card={data.card}
                        index={data.index}
                        randomPos={data.randomPos}
                        bentoPos={data.bentoPos}
                        scrollProgress={scrollYProgress}
                    />
                ))}

                <Environment preset="city" />
            </Canvas>
        </div>
    )
}
