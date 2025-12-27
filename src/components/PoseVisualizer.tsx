"use client";

import { useEffect, useRef } from "react";
import { PoseLandmarks } from "@/lib/analysis/types";
import { Pose } from "@mediapipe/pose";
import { POSE_CONNECTIONS } from "@/lib/mediapipe_constants";


interface PoseVisualizerProps {
    landmarks: PoseLandmarks | null;
    width: number;
    height: number;
}

export function PoseVisualizer({ landmarks, width, height }: PoseVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !landmarks) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        // Filter and map landmarks with Z-depth preservation
        const visibleLandmarks = landmarks.map(lm => ({
            x: lm.x * width,
            y: lm.y * height,
            z: lm.z, // Keep Z for depth visualization
            visibility: lm.visibility
        }));

        // Helper to get point if visible
        const getPoint = (idx: number) => {
            const lm = visibleLandmarks[idx];
            return (lm.visibility || 0) > 0.5 ? lm : null;
        };

        // 1. Draw Skeleton Connectors (Base Layer)
        POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
            const start = getPoint(startIdx);
            const end = getPoint(endIdx);

            if (start && end) {
                // Base skeleton - clearer visibility
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 2;
                ctx.shadowBlur = 0; // No glow for lines
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        });

        // 2. Draw Standard Landmarks (Dimmed)
        visibleLandmarks.forEach((lm, index) => {
            // Skip core points (shoulders 11/12, hips 23/24) as we will draw them specially
            if ([11, 12, 23, 24].includes(index)) return;

            if ((lm.visibility || 0) > 0.5) {
                ctx.beginPath();
                ctx.arc(lm.x, lm.y, 3, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.shadowBlur = 0;
                ctx.fill();
            }
        });

        // 3. --- ADVANCED CORE VISUALIZATION ---
        const leftShoulder = getPoint(11);
        const rightShoulder = getPoint(12);
        const leftHip = getPoint(23);
        const rightHip = getPoint(24);

        if (leftShoulder && rightShoulder && leftHip && rightHip) {


            // Helper: Calculate size based on Z depth (closer = bigger)
            // Z is typically roughly -1 to 1 meter relative to hips center
            const getRadius = (z: number) => Math.max(4, 6 - (z * 5));

            // Calculate centers for later use
            const thoraxCenter = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
            const hipCenter = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
            const abdomenCenter = { x: (thoraxCenter.x + hipCenter.x) / 2, y: (thoraxCenter.y + hipCenter.y) / 2 };

            // === PELVIS TRAPEZOID (上宽下窄) ===
            // Simulate pubic bone below hip line
            const hipWidth = Math.abs(rightHip.x - leftHip.x);
            const pelvisBottom = hipCenter.y + hipWidth * 0.35; // Pubic bone position below hips
            const pubicWidth = hipWidth * 0.3; // Narrower at bottom

            ctx.beginPath();
            ctx.moveTo(leftHip.x, leftHip.y);
            ctx.lineTo(rightHip.x, rightHip.y);
            ctx.lineTo(hipCenter.x - pubicWidth / 2, pelvisBottom);
            ctx.lineTo(hipCenter.x + pubicWidth / 2, pelvisBottom);
            ctx.closePath();
            ctx.fillStyle = 'rgba(229, 222, 255, 0.08)'; // Lavender tint for pelvis
            ctx.strokeStyle = 'rgba(229, 222, 255, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.fill();
            ctx.stroke();

            // === TORSO - LOWER TRAPEZOID (上窄下宽) ===
            // From ~waist/abdomen to hips - narrower at top, wider at bottom
            const waistWidth = hipWidth * 0.75; // Waist narrower than hips

            ctx.beginPath();
            ctx.moveTo(abdomenCenter.x + waistWidth / 2, abdomenCenter.y);
            ctx.lineTo(abdomenCenter.x - waistWidth / 2, abdomenCenter.y);
            ctx.lineTo(rightHip.x, rightHip.y);
            ctx.lineTo(leftHip.x, leftHip.y);
            ctx.closePath();
            ctx.fillStyle = 'rgba(225, 248, 99, 0.06)'; // Neon green tint
            ctx.strokeStyle = 'rgba(225, 248, 99, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.fill();
            ctx.stroke();

            // === TORSO - UPPER TRAPEZOID (上宽下窄) ===
            // From shoulders to ~waist - wider at top, narrower at bottom
            ctx.beginPath();
            ctx.moveTo(leftShoulder.x, leftShoulder.y);
            ctx.lineTo(rightShoulder.x, rightShoulder.y);
            ctx.lineTo(abdomenCenter.x - waistWidth / 2, abdomenCenter.y);
            ctx.lineTo(abdomenCenter.x + waistWidth / 2, abdomenCenter.y);
            ctx.closePath();
            ctx.fillStyle = 'rgba(225, 248, 99, 0.08)'; // Neon green tint, slightly stronger
            ctx.strokeStyle = 'rgba(225, 248, 99, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.fill();
            ctx.stroke();

            // Set Glow for Axes
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#E1F863';

            // B. Draw Thorax Axis (Shoulder Girdle) - Pink -> Red/Neon
            ctx.beginPath();
            ctx.moveTo(leftShoulder.x, leftShoulder.y);
            ctx.lineTo(rightShoulder.x, rightShoulder.y);
            ctx.strokeStyle = '#E1F863'; // Neon Green
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.stroke();

            // C. Draw Pelvis Axis (Hip Girdle) - Green -> Neon Green
            ctx.beginPath();
            ctx.moveTo(leftHip.x, leftHip.y);
            ctx.lineTo(rightHip.x, rightHip.y);
            ctx.strokeStyle = '#E1F863'; // Neon Green
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.stroke();

            // D. Draw Spine / Abdomen Center Line
            ctx.beginPath();
            ctx.moveTo(thoraxCenter.x, thoraxCenter.y);
            ctx.lineTo(hipCenter.x, hipCenter.y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]); // Dashed spine
            ctx.shadowBlur = 0; // Remove glow for spine
            ctx.stroke();
            ctx.setLineDash([]);

            // E. Draw Joints with Depth Perception (The "Points")
            const drawJoint = (pt: { x: number, y: number, z: number }, color: string) => {
                const r = getRadius(pt.z);

                // Glow
                ctx.shadowBlur = 15;
                ctx.shadowColor = color;

                ctx.beginPath();
                ctx.arc(pt.x, pt.y, r, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();

                // Reset glow
                ctx.shadowBlur = 0;

                // Center dot
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, r / 2, 0, 2 * Math.PI);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();
            };

            const neonGreen = '#E1F863';

            drawJoint(leftShoulder, neonGreen);
            drawJoint(rightShoulder, neonGreen);

            drawJoint(leftHip, neonGreen);
            drawJoint(rightHip, neonGreen);

            // Draw Center Points (smaller)
            // Thorax Center
            ctx.beginPath(); ctx.arc(thoraxCenter.x, thoraxCenter.y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFFFFF'; ctx.fill();

            // Abdomen Center
            ctx.beginPath(); ctx.arc(abdomenCenter.x, abdomenCenter.y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = neonGreen; ctx.fill();
        }

    }, [landmarks, width, height]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="absolute top-0 left-0 w-full h-full pointer-events-none object-contain"
        />
    );
}
