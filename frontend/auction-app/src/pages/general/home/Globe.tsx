import { useEffect, useRef } from 'react';

interface Node3D {
    x: number;
    y: number;
    z: number;
}

const NODE_COUNT = 80;
const EDGE_DIST = 105;
const RADIUS = 260;
const DAMPING = 0.92;

function latLonToXYZ(lat: number, lon: number, r: number): Node3D {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = lon * (Math.PI / 180);
    return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi),
        z: r * Math.sin(phi) * Math.sin(theta),
    };
}

function dist3(a: Node3D, b: Node3D): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

// Rotate around Y axis (horizontal drag)
function rotateY(p: Node3D, a: number): Node3D {
    const cos = Math.cos(a), sin = Math.sin(a);
    return {
        x: p.x * cos - p.z * sin,
        y: p.y,
        z: p.x * sin + p.z * cos,
    };
}

// Rotate around X axis (vertical drag)
function rotateX(p: Node3D, a: number): Node3D {
    const cos = Math.cos(a), sin = Math.sin(a);
    return {
        x: p.x,
        y: p.y * cos - p.z * sin,
        z: p.y * sin + p.z * cos,
    };
}

export default function Globe() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = canvas.width;
        const H = canvas.height;
        const cx = W / 2;
        const cy = H / 2;

        // Generate nodes
        const rawNodes: Node3D[] = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            const lat = Math.random() * 160 - 80;
            const lon = Math.random() * 360 - 180;
            rawNodes.push(latLonToXYZ(lat, lon, RADIUS));
        }

        // Rotation state
        let angleY = 0;
        let angleX = 0.2;
        let velY = 0.003;
        let velX = 0;

        // Mouse drag state
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;

        const onMouseDown = (e: MouseEvent) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            velY = 0;
            velX = 0;
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            velY = dx * 0.003;
            velX = dy * 0.003;
            angleY += velY;
            angleX += velX;
            // Clamp vertical rotation so it doesn't flip
            angleX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, angleX));
            lastX = e.clientX;
            lastY = e.clientY;
        };

        const onMouseUp = () => { isDragging = false; };

        // Touch support
        const onTouchStart = (e: TouchEvent) => {
            isDragging = true;
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
            velY = 0;
            velX = 0;
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!isDragging) return;
            const dx = e.touches[0].clientX - lastX;
            const dy = e.touches[0].clientY - lastY;
            velY = dx * 0.003;
            velX = dy * 0.003;
            angleY += velY;
            angleX += velX;
            angleX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, angleX));
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
        };

        canvas.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onMouseUp);

        let rafId: number;

        const draw = () => {
            ctx.clearRect(0, 0, W, H);

            if (!isDragging) {
                // Auto-spin + dampen thrown velocity
                velY = velY * DAMPING + 0.003 * (1 - DAMPING);
                velX *= DAMPING;
                angleY += velY;
                angleX += velX;
                angleX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, angleX));
            }

            // Project all nodes
            const projected = rawNodes.map((n) => {
                const p1 = rotateX(n, angleX);
                const p2 = rotateY(p1, angleY);
                return { sx: cx + p2.x, sy: cy - p2.y, z: p2.z, raw: p2 };
            });

            // Draw edges
            for (let i = 0; i < rawNodes.length; i++) {
                for (let j = i + 1; j < rawNodes.length; j++) {
                    if (dist3(rawNodes[i], rawNodes[j]) > EDGE_DIST) continue;
                    const pi = projected[i];
                    const pj = projected[j];
                    if (pi.z < -40 && pj.z < -40) continue;
                    const depth = (pi.z + pj.z) / (2 * RADIUS);
                    const alpha = Math.min(Math.max(depth * 0.85 + 0.3, 0.06), 0.88);
                    ctx.beginPath();
                    ctx.moveTo(pi.sx, pi.sy);
                    ctx.lineTo(pj.sx, pj.sy);
                    ctx.strokeStyle = `rgba(245, 197, 24, ${alpha})`;
                    ctx.lineWidth = 0.9;
                    ctx.stroke();
                }
            }

            // Draw nodes
            for (let i = 0; i < projected.length; i++) {
                const p = projected[i];
                if (p.z < -40) continue;
                const depth = p.z / RADIUS;
                const alpha = Math.min(Math.max(depth * 0.75 + 0.4, 0.12), 1);
                const r = depth > 0 ? 2.8 : 1.6;
                ctx.beginPath();
                ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(13, 13, 13, ${alpha})`;
                ctx.fill();
            }

            rafId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(rafId);
            canvas.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            canvas.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onMouseUp);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={600}
            height={600}
            style={{ cursor: 'grab', display: 'block' }}
            aria-label="Interactive network globe — drag to rotate"
        />
    );
}