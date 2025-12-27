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
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 3;
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
                ctx.arc(lm.x, lm.y, 2, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
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
            const getRadius = (z: number) => Math.max(4, 8 - (z * 10));

            // A. Draw Torso Plane (Trapezoid) to show twist/shear
            ctx.beginPath();
            ctx.moveTo(leftShoulder.x, leftShoulder.y);
            ctx.lineTo(rightShoulder.x, rightShoulder.y);
            ctx.lineTo(rightHip.x, rightHip.y);
            ctx.lineTo(leftHip.x, leftHip.y);
            ctx.closePath();
            ctx.fillStyle = 'rgba(100, 100, 255, 0.1)'; // Very faint blue fill
            ctx.fill();

            // B. Draw Thorax Axis (Shoulder Girdle) - Pink
            ctx.beginPath();
            ctx.moveTo(leftShoulder.x, leftShoulder.y);
            ctx.lineTo(rightShoulder.x, rightShoulder.y);
            ctx.strokeStyle = 'rgba(236, 72, 153, 1.0)'; // Pink-500 Full Opacity
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.stroke();

            // C. Draw Pelvis Axis (Hip Girdle) - Green
            ctx.beginPath();
            ctx.moveTo(leftHip.x, leftHip.y);
            ctx.lineTo(rightHip.x, rightHip.y);
            ctx.strokeStyle = 'rgba(34, 197, 94, 1.0)'; // Green-500 Full Opacity
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.stroke();

            // D. Draw Spine / Abdomen Center Line (Yellow)
            const thoraxCenter = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
            const hipCenter = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
            const abdomenCenter = { x: (thoraxCenter.x + hipCenter.x) / 2, y: (thoraxCenter.y + hipCenter.y) / 2 };

            ctx.beginPath();
            ctx.moveTo(thoraxCenter.x, thoraxCenter.y);
            ctx.lineTo(hipCenter.x, hipCenter.y);
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.8)'; // Yellow-500
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]); // Dashed spine
            ctx.stroke();
            ctx.setLineDash([]);

            // E. Draw Joints with Depth Perception (The "Points")
            const drawJoint = (pt: { x: number, y: number, z: number }, color: string) => {
                const r = getRadius(pt.z);

                // Glow
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, r + 4, 0, 2 * Math.PI);
                ctx.fillStyle = color.replace('1)', '0.3)');
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, r, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();

                // Stroke
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();
            };

            drawJoint(leftShoulder, 'rgba(236, 72, 153, 1)');
            drawJoint(rightShoulder, 'rgba(236, 72, 153, 1)');

            drawJoint(leftHip, 'rgba(34, 197, 94, 1)');
            drawJoint(rightHip, 'rgba(34, 197, 94, 1)');

            // Draw Center Points (smaller)
            // Thorax Center
            ctx.beginPath(); ctx.arc(thoraxCenter.x, thoraxCenter.y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(236, 72, 153, 1)'; ctx.fill();

            // Abdomen Center
            ctx.beginPath(); ctx.arc(abdomenCenter.x, abdomenCenter.y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(234, 179, 8, 1)'; ctx.fill();
            ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
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
