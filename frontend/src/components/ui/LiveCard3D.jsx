import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Text, RoundedBox, Environment } from '@react-three/drei'
import { motion } from 'framer-motion-3d'
import * as THREE from 'three'

// Typewriter hook for React
function useTypewriter(text, speed = 40) {
    const [displayed, setDisplayed] = useState('')
    useEffect(() => {
        let i = 0;
        setDisplayed('')
        if (!text) return;

        // Quick typing simulation
        const timer = setInterval(() => {
            setDisplayed(text.slice(0, i + 1))
            i++
            if (i >= text.length) clearInterval(timer)
        }, speed)
        return () => clearInterval(timer)
    }, [text, speed])
    return displayed
}

const CardMesh = ({ form, animationState, cardRef }) => {
    const materialRef = useRef()
    const nameText = useTypewriter(form.holderName || 'YOUR NAME', 50)
    const rawDigits = (form.cardNumber || '').replace(/\s/g, '')
    const masked = rawDigits.length > 4 ? `•••• •••• •••• ${rawDigits.slice(-4)}` : '•••• •••• •••• ••••'

    // Animate material emissive color on liftoff/vortex
    useFrame((state, delta) => {
        if (materialRef.current) {
            const targetEmissive = animationState === 'liftoff' ? 1.5 : (animationState === 'idle' ? 0.05 : 0.4);
            materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
                materialRef.current.emissiveIntensity,
                targetEmissive,
                0.1
            );
        }
    })

    return (
        <motion.group ref={cardRef}>
            <RoundedBox args={[3.2, 2.0, 0.05]} radius={0.08} smoothness={4}>
                <meshPhysicalMaterial
                    ref={materialRef}
                    color="#080808"
                    metalness={0.95}
                    roughness={0.2}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    emissive="#222"
                    emissiveIntensity={0.05}
                />

                {/* Chip details */}
                <group position={[-1.2, 0.2, 0.026]}>
                    <mesh>
                        <planeGeometry args={[0.4, 0.3]} />
                        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
                    </mesh>
                </group>

                {/* Card Elements positioned relative to card center */}
                <group position={[-1.3, 0.7, 0.031]}>
                    <Text fontSize={0.15} color="white" anchorX="left" anchorY="top" letterSpacing={0.1}>
                        {form.network || 'NETWORK'}
                    </Text>
                </group>

                <group position={[-1.3, -0.25, 0.031]}>
                    <Text fontSize={0.22} color="#cccccc" anchorX="left" letterSpacing={0.25}>
                        {masked}
                    </Text>
                </group>

                <group position={[-1.3, -0.7, 0.031]}>
                    <Text fontSize={0.07} color="#888888" anchorX="left" anchorY="bottom">
                        CARD HOLDER
                    </Text>
                    <Text fontSize={0.14} color="white" position={[0, -0.15, 0]} anchorX="left" anchorY="bottom">
                        {nameText}
                    </Text>
                </group>

                <group position={[1.3, -0.7, 0.031]}>
                    <Text fontSize={0.07} color="#888888" anchorX="right" anchorY="bottom">
                        EXPIRES
                    </Text>
                    <Text fontSize={0.14} color="white" position={[0, -0.15, 0]} anchorX="right" anchorY="bottom">
                        {form.expiry || 'MM/YY'}
                    </Text>
                </group>
            </RoundedBox>
        </motion.group>
    )
}

function WalletWireframe({ visible }) {
    // A simple stylized wallet slot representation
    return (
        <motion.group
            position={[2.5, -1.8, -1]}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
            transition={{ duration: 0.5 }}
        >
            <mesh>
                <boxGeometry args={[1.5, 0.2, 1]} />
                <meshBasicMaterial color="#d4af37" wireframe transparent opacity={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.5]}>
                <boxGeometry args={[1.5, 0.5, 0.05]} />
                <meshBasicMaterial color="#d4af37" transparent opacity={0.1} />
            </mesh>
        </motion.group>
    )
}

// Custom point shader for gold particles
const ParticleShaderMaterial = {
    uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color("#d4af37") }
    },
    vertexShader: `
    uniform float time;
    attribute float size;
    attribute vec3 velocity;
    varying float vAlpha;
    void main() {
      vec3 pos = position + velocity * time;
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size * (10.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
      
      // Calculate alpha based on time (fade out over 1.5 seconds)
      vAlpha = max(0.0, 1.0 - (time / 1.5));
    }
  `,
    fragmentShader: `
    uniform vec3 color;
    varying float vAlpha;
    void main() {
      if(vAlpha <= 0.01) discard;
      // Circular particle
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float ll = length(xy);
      if(ll > 0.5) discard;
      
      // Soft center
      gl_FragColor = vec4(color, vAlpha * pow(1.0 - (ll*2.0), 1.5));
    }
  `
}

function ParticleBurst({ active, position }) {
    const mesh = useRef()
    const [time, setTime] = useState(0)

    const { positions, velocities, sizes } = useMemo(() => {
        const count = 150
        const p = new Float32Array(count * 3)
        const v = new Float32Array(count * 3)
        const s = new Float32Array(count)
        for (let i = 0; i < count; i++) {
            p[i * 3] = 0; p[i * 3 + 1] = 0; p[i * 3 + 2] = 0;
            v[i * 3] = (Math.random() - 0.5) * 8;
            v[i * 3 + 1] = (Math.random() - 0.5) * 8 + 3; // upward bias
            v[i * 3 + 2] = (Math.random() - 0.5) * 8;
            s[i] = Math.random() * 25 + 10;
        }
        return { positions: p, velocities: v, sizes: s }
    }, [active]) // re-roll on activation

    useFrame((state, delta) => {
        if (mesh.current) {
            if (active) {
                mesh.current.material.uniforms.time.value += delta;
            } else {
                mesh.current.material.uniforms.time.value = 0;
            }
        }
    })

    if (!active && mesh.current?.material?.uniforms?.time?.value === 0) return null;

    return (
        <points ref={mesh} position={position}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={150} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-velocity" count={150} array={velocities} itemSize={3} />
                <bufferAttribute attach="attributes-size" count={150} array={sizes} itemSize={1} />
            </bufferGeometry>
            <shaderMaterial args={[ParticleShaderMaterial]} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    )
}

const SceneController = ({ form, animationState }) => {
    const cardGroupRef = useRef()
    const curveRef = useRef()
    const spotLightRef = useRef()
    const targetObjRef = useRef(new THREE.Object3D())

    // CatmullRomCurve3 path evaluating to arrays for Framer Motion keyframes
    const curvePoints = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.5, 1),
            new THREE.Vector3(1, 0, 0.5),
            new THREE.Vector3(2, -0.8, -0.2),
            new THREE.Vector3(2.5, -1.8, -1.2) // Just above Wallet position
        ])
        return curve.getPoints(30) // 30 segments for smooth keyframes
    }, [])

    // Tracking spotlight target
    useFrame(() => {
        if (spotLightRef.current && cardGroupRef.current) {
            cardGroupRef.current.getWorldPosition(targetObjRef.current.position)
            spotLightRef.current.target = targetObjRef.current;
            spotLightRef.current.target.updateMatrixWorld();
        }
    })

    // Framer motion variants
    const getVariants = () => {
        return {
            idle: {
                scale: 1, x: 0, y: 0, z: 0,
                rotateX: 0, rotateY: 0, rotateZ: 0
            },
            liftoff: {
                scale: 1.2, x: 0, y: 0.5, z: 1,
                rotateX: -0.1, rotateY: -0.2, rotateZ: 0.05,
                transition: { duration: 0.6, ease: "easeOut" }
            },
            vortex: {
                x: curvePoints.map(p => p.x),
                y: curvePoints.map(p => p.y),
                z: curvePoints.map(p => p.z),
                rotateX: curvePoints.map((_, i) => -0.1 + (i * 0.05)), // Spin sequence
                rotateY: curvePoints.map((_, i) => -0.2 + (i * 0.08)),
                rotateZ: curvePoints.map((_, i) => 0.05 + (i * 0.02)),
                scale: curvePoints.map((_, i) => 1.2 - (i / 30) * 0.8), // Shrink to 0.4
                transition: { duration: 1.2, ease: "easeInOut" }
            },
            snap: {
                x: 2.5, y: -1.75, z: -1,
                rotateX: Math.PI / 2 - 0.2, rotateY: 0, rotateZ: 0,
                scale: 0.35,
                transition: { type: "spring", stiffness: 300, damping: 20 }
            }
        }
    }

    const isFloating = animationState === 'idle';

    return (
        <>
            <ambientLight intensity={2} />
            <spotLight
                ref={spotLightRef}
                position={[-1, 4, 3]}
                angle={0.6}
                penumbra={0.8}
                intensity={100}
                color="#ffffff"
            />
            <Environment preset="night" />

            {/* Internal target for tracking */}
            <primitive object={targetObjRef.current} />

            <Float speed={isFloating ? 2 : 0} rotationIntensity={isFloating ? 1.5 : 0} floatIntensity={isFloating ? 1.2 : 0}>
                <motion.group
                    ref={cardGroupRef}
                    initial="idle"
                    animate={animationState}
                    variants={getVariants()}
                >
                    <CardMesh form={form} animationState={animationState} />
                </motion.group>
            </Float>

            <WalletWireframe visible={animationState !== 'idle'} />
            <ParticleBurst active={animationState === 'snap'} position={[2.5, -1.8, -1]} />
        </>
    )
}

export default function LiveCard3D({ form, animationState }) {
    return (
        <div style={{ width: '600px', height: '400px', borderRadius: 24, overflow: 'hidden', background: '#0a0a0a', border: '1px solid #1c1c1c' }}>
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <SceneController form={form} animationState={animationState} />
            </Canvas>
        </div>
    )
}
