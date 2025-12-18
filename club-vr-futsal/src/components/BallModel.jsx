import React, { useMemo, useRef, Suspense } from 'react';
import { Image, Billboard, Text, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Error Boundary para capturar errores de Three.js
class ThreeErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('BallModel error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full h-[500px] flex items-center justify-center bg-black/20 rounded-lg">
                    <p className="text-white/60">Error cargando modelo 3D</p>
                </div>
            );
        }
        return this.props.children;
    }
}



// Create Truncated Icosahedron data once
const createSoccerBallData = (radius) => {
    const icosahedron = new THREE.IcosahedronGeometry(radius, 0);
    const posAttr = icosahedron.attributes.position;
    const vertices = [];
    for (let i = 0; i < posAttr.count; i++) {
        vertices.push(new THREE.Vector3().fromBufferAttribute(posAttr, i));
    }

    // Merge duplicate vertices
    const uniqueVertices = [];
    const positions = [];
    const tolerance = 0.0001;

    // Simple deduplication
    for (let i = 0; i < vertices.length; i++) {
        let foundIdx = -1;
        for (let j = 0; j < uniqueVertices.length; j++) {
            if (uniqueVertices[j].distanceTo(vertices[i]) < tolerance) {
                foundIdx = j;
                break;
            }
        }
        if (foundIdx === -1) {
            uniqueVertices.push(vertices[i]);
            positions.push(uniqueVertices.length - 1);
        } else {
            positions.push(foundIdx);
        }
    }

    // 2. Identify Edges from Icosahedron (each face is triangle)
    // Icosahedron (radius, 0) has 20 faces. 
    // We can manually build the truncated structure or just derive from edges.
    // Simpler approach for "Pentagons and Hexagons":
    // The vertices of the truncated icosahedron are at the 1/3 and 2/3 points of the icosahedron edges.

    // Let's index the edges
    const edges = {};
    const addEdge = (a, b) => {
        const min = Math.min(a, b);
        const max = Math.max(a, b);
        const key = `${min}_${max}`;
        edges[key] = [min, max];
    };

    // Icosahedron indices (if not indexed, we rely on groups of 3)
    // The deduplication above gives us 'positions' array which are indices into 'uniqueVertices'
    for (let i = 0; i < positions.length; i += 3) {
        addEdge(positions[i], positions[i + 1]);
        addEdge(positions[i + 1], positions[i + 2]);
        addEdge(positions[i + 2], positions[i]);
    }

    // New vertices on edges
    const newVerts = []; // Array of Vector3
    const edgeMap = {}; // key -> [idx1, idx2] in newVerts

    Object.keys(edges).forEach(key => {
        const [a, b] = edges[key];
        const v1 = uniqueVertices[a];
        const v2 = uniqueVertices[b];
        // 1/3 and 2/3 splits projected to radius
        const n1 = v1.clone().lerp(v2, 1 / 3).normalize().multiplyScalar(radius);
        const n2 = v1.clone().lerp(v2, 2 / 3).normalize().multiplyScalar(radius);

        // We push them in order relative to a->b direction convention used later?
        // Actually, let's just push them.
        const base = newVerts.length;
        newVerts.push(n1, n2);
        edgeMap[key] = [base, base + 1];
    });

    // Faces
    const pentagons = []; // 12 pentagons (from original vertices)
    const hexagons = [];  // 20 hexagons (from original faces)

    // Build Pentagons: Around each original vertex
    const vertNeighbors = Array(uniqueVertices.length).fill().map(() => []);
    Object.keys(edges).forEach(key => {
        const [a, b] = edges[key];
        vertNeighbors[a].push(b);
        vertNeighbors[b].push(a);
    });

    for (let i = 0; i < uniqueVertices.length; i++) {
        // Sort neighbors to go around in circle
        const center = uniqueVertices[i];
        const neighbors = vertNeighbors[i];
        // Sort
        const up = center.clone().normalize();
        const arbitrary = Math.abs(up.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
        const right = new THREE.Vector3().crossVectors(up, arbitrary).normalize();
        const forward = new THREE.Vector3().crossVectors(right, up).normalize();

        neighbors.sort((nA, nB) => {
            const vA = uniqueVertices[nA].clone().sub(center);
            const vB = uniqueVertices[nB].clone().sub(center);
            const angleA = Math.atan2(vA.dot(forward), vA.dot(right));
            const angleB = Math.atan2(vB.dot(forward), vB.dot(right));
            return angleA - angleB;
        });

        // Construct pentagon indices from edgeMap
        const faceIndices = [];
        for (let j = 0; j < neighbors.length; j++) {
            const curr = i;
            const next = neighbors[j];
            const key = curr < next ? `${curr}_${next}` : `${next}_${curr}`;
            // If curr < next, we want the point closer to curr (1/3), which is index 0 in our push order
            // If curr > next, we want the point closer to curr (2/3), which is index 1
            const edgeInds = edgeMap[key];
            faceIndices.push(curr < next ? edgeInds[0] : edgeInds[1]);
        }
        pentagons.push(faceIndices);
    }

    // Build Hexagons: From original faces
    for (let i = 0; i < positions.length; i += 3) {
        const a = positions[i];
        const b = positions[i + 1];
        const c = positions[i + 2];
        const faceIndices = [];

        const getEdgePoints = (v1, v2) => {
            const key = v1 < v2 ? `${v1}_${v2}` : `${v2}_${v1}`;
            const inds = edgeMap[key];
            // Order: v1->v2. if v1<v2: 0->1. if v1>v2: 1->0
            return v1 < v2 ? [inds[0], inds[1]] : [inds[1], inds[0]];
        };

        // a->b, b->c, c->a
        const ab = getEdgePoints(a, b);
        const bc = getEdgePoints(b, c);
        const ca = getEdgePoints(c, a);

        // Hexagon vertices in order
        // The hexagon is formed by the inner segments: [a]--ab1--ab2--[b]--bc1--bc2--[c]--ca1--ca2--[a]
        // Actually the hexagon connects the new points: ab1, ab2, bc1, bc2, ca1, ca2 is not right?
        // Wait, the truncated face comes from cutting the corners. The center of original face becomes hexagon.
        // Vertices are: ab.second, ab.first (wait), no.
        // Proper order for hexagon inside face (a,b,c):
        // ab[1], bc[0], bc[1], ca[0], ca[1], ab[0]
        faceIndices.push(ab[1], bc[0], bc[1], ca[0], ca[1], ab[0]);
        hexagons.push(faceIndices);
    }

    return { newVerts, pentagons, hexagons };
};

// Subdivide helper (non-recursive for simplicity/memory or limited depth)
// For performance, we generate geometry buffers directly
const generateFaceGeometry = (faceIndices, vertices, radius, depth = 0) => {
    // Center of face
    const center = new THREE.Vector3();
    faceIndices.forEach(idx => center.add(vertices[idx]));
    center.divideScalar(faceIndices.length).normalize().multiplyScalar(radius);

    const positions = [];

    const pushTri = (v1, v2, v3) => {
        positions.push(v1.x, v1.y, v1.z);
        positions.push(v2.x, v2.y, v2.z);
        positions.push(v3.x, v3.y, v3.z);
    };

    const subdivideTri = (v1, v2, v3, d) => {
        if (d <= 0) {
            pushTri(v1, v2, v3);
            return;
        }
        const m1 = v1.clone().add(v2).normalize().multiplyScalar(radius);
        const m2 = v2.clone().add(v3).normalize().multiplyScalar(radius);
        const m3 = v3.clone().add(v1).normalize().multiplyScalar(radius);

        subdivideTri(v1, m1, m3, d - 1);
        subdivideTri(m1, v2, m2, d - 1);
        subdivideTri(m3, m2, v3, d - 1);
        subdivideTri(m1, m2, m3, d - 1);
    };

    // Fan triangulation from center
    for (let i = 0; i < faceIndices.length; i++) {
        const v1 = vertices[faceIndices[i]];
        const v2 = vertices[faceIndices[(i + 1) % faceIndices.length]];
        subdivideTri(center, v1, v2, depth);
    }

    return positions;
};

const OptimizedBall = React.memo(() => {
    const radius = 1;
    const geometryData = useMemo(() => {
        const { newVerts, pentagons, hexagons } = createSoccerBallData(radius);

        // Single buffer for all pentagons
        const pentagonPositions = [];
        pentagons.forEach(face => {
            pentagonPositions.push(...generateFaceGeometry(face, newVerts, radius, 1)); // Depth 1 is enough for visual
        });

        // Single buffer for all hexagons
        const hexagonPositions = [];
        hexagons.forEach(face => {
            hexagonPositions.push(...generateFaceGeometry(face, newVerts, radius, 1));
        });

        const pentGeo = new THREE.BufferGeometry();
        pentGeo.setAttribute('position', new THREE.Float32BufferAttribute(pentagonPositions, 3));
        pentGeo.computeVertexNormals();

        const hexGeo = new THREE.BufferGeometry();
        hexGeo.setAttribute('position', new THREE.Float32BufferAttribute(hexagonPositions, 3));
        hexGeo.computeVertexNormals();

        return { pentGeo, hexGeo };
    }, []);

    return (
        <group scale={1.5}>
            {/* Merged Pentagons (Black) */}
            <mesh geometry={geometryData.pentGeo}>
                <meshLambertMaterial color="#222" side={THREE.DoubleSide} />
            </mesh>

            {/* Merged Hexagons (White) */}
            <mesh geometry={geometryData.hexGeo}>
                <meshLambertMaterial color="#fff" side={THREE.DoubleSide} />
            </mesh>

            {/* Occlusion sphere */}
            <mesh>
                <icosahedronGeometry args={[0.99, 1]} />
                <meshBasicMaterial color="black" visible={false} />
            </mesh>
        </group>
    );
});

const SponsorsOrbit = ({ sponsors }) => {
    const groupRef = useRef();
    const radius = 2.5;

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.2;
        }
    });

    // Si no hay sponsors, mostrar DOS tarjetas girando alrededor del balón
    if (!sponsors || sponsors.length === 0) {
        const messages = [
            "Aún no hay patrocinadores registrados",
            "¡Únete y forma parte de nuestra familia deportiva!"
        ];

        return (
            <group ref={groupRef}>
                {messages.map((msg, i) => {
                    const angle = (i / messages.length) * Math.PI * 2;
                    const x = Math.sin(angle) * radius;
                    const z = Math.cos(angle) * radius;

                    return (
                        <Billboard key={i} position={[x, 0, z]}>
                            <group scale={1}>

                                {/* TARJETA MEJORADA CON ROUNDEDBOX */}
                                <RoundedBox args={[2, 1.1, 0.08]} radius={0.2} smoothness={8}>
                                    <meshStandardMaterial
                                        transparent
                                        opacity={0.8}
                                        color="#0a0a0a"
                                        metalness={0.4}
                                        roughness={0.2}
                                    />
                                </RoundedBox>

                                {/* GLOW SUAVE DETRÁS DE LA TARJETA */}
                                <mesh position={[0, 0, -0.05]}>
                                    <planeGeometry args={[2, 1.3]} />
                                    <meshBasicMaterial
                                        color="rgba(40, 184, 61, 1)"
                                        transparent
                                        opacity={0.15}
                                    />
                                </mesh>

                                {/* TEXTO MEJORADO */}
                                <Text
                                    position={[0.2, 0, 0.08]}
                                    fontSize={0.2}
                                    color="#ffffff"
                                    anchorX="center"
                                    anchorY="middle"
                                    maxWidth={2}
                                    outlineColor="rgba(9, 171, 33, 1)"
                                    outlineWidth={0.035}
                                    fontWeight={600}
                                >
                                    {msg}
                                </Text>

                            </group>
                        </Billboard>

                    );
                })}
            </group>
        );
    }
    // Mostrar los logos normalmente - filtrar sponsors sin logo válido
    const validSponsors = sponsors.filter(s => s.logo && s.logo.startsWith('http'));
    
    if (validSponsors.length === 0) {
        return (
            <group ref={groupRef}>
                <Billboard position={[0, 0, 0]}>
                    <Text
                        fontSize={0.3}
                        color="#ffffff"
                        anchorX="center"
                        anchorY="middle"
                    >
                        Cargando sponsors...
                    </Text>
                </Billboard>
            </group>
        );
    }
    
    return (
        <group ref={groupRef}>
            {validSponsors.map((sponsor, i) => {
                const angle = (i / validSponsors.length) * Math.PI * 2;
                const x = Math.sin(angle) * radius;
                const z = Math.cos(angle) * radius;

                return (
                    <Billboard key={sponsor.id || i} position={[x, 0, z]}>
                        <Suspense fallback={null}>
                            <Image
                                url={sponsor.logo}
                                transparent
                                scale={[0.89, 0.7]}
                                onClick={() =>
                                    sponsor.website && window.open(sponsor.website, "_blank")
                                }
                                onError={() => console.warn('Error loading logo:', sponsor.logo)}
                            />
                        </Suspense>
                    </Billboard>
                );
            })}
        </group>
    );
};


const BallModel = ({ sponsors }) => {
    // Filtrar sponsors con logos válidos antes de renderizar
    const validSponsors = (sponsors || []).filter(s => s.logo && s.logo.startsWith('http'));
    
    return (
        <ThreeErrorBoundary>
            <div className="w-full h-[500px] bg-transparent relative z-50">
                <Canvas
                    shadows={false}
                    dpr={[1, 2]}
                    camera={{ position: [0, 0, 5], fov: 45 }}
                    className="z-50"
                    gl={{ powerPreference: "high-performance", antialias: true }}
                    onError={(e) => console.error('Canvas error:', e)}
                >
                    <Suspense fallback={null}>
                        <ambientLight intensity={0.6} />
                        <directionalLight position={[5, 5, 5]} intensity={1.2} />

                        <Center>
                            <OptimizedBall />
                            <SponsorsOrbit sponsors={validSponsors} />
                        </Center>

                        <Environment preset="city" />

                        <OrbitControls
                            makeDefault
                            autoRotate
                            autoRotateSpeed={0.5}
                            minDistance={2}
                            maxDistance={10}
                            enableZoom={false}
                            enablePan={false}
                        />
                    </Suspense>
                </Canvas>
            </div>
        </ThreeErrorBoundary>
    );
};

export default BallModel;
