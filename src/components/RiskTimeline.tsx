"use client";

import { useEffect, useRef } from "react";
import { AssessmentIssue } from "@/lib/analysis/types";

interface TimelineProps {
    issues: { time: number; issues: AssessmentIssue[] }[];
    duration: number; // Video duration in seconds
    currentTime: number;
    onSeek: (time: number) => void;
}

export function RiskTimeline({ issues, duration, currentTime, onSeek }: TimelineProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        if (!duration || duration <= 0) {
            // Clear but show background
            ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
            ctx.fillRect(0, 0, width, height);
            return;
        }

        // Clear

        // Background - Transparent with border
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < width; i += 20) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
        }
        ctx.stroke();

        // Draw Markers
        issues.forEach((entry) => {
            if (entry.issues.length === 0) return;

            const x = (entry.time / duration) * width;

            // Color based on risk level
            const hasHighRisk = entry.issues.some(i => i.riskLevel === 'high');
            ctx.fillStyle = hasHighRisk ? "#FF4444" : "#E1F863"; // Red : Neon Green (used for medium risk in this design context? No, wait. Medium is Yellow in guideline. High is Red. Low is Green. Let's stick to Red for High, Yellow for Mid)
            // Correction: Guideline says: High=Red, Mid=Lavender/Yellow? 
            // Let's use Red for High, Yellow for Mid as per AnalysisPage logic.
            ctx.fillStyle = hasHighRisk ? "#FF4444" : "#FACC15"; // Red-500 : Yellow-400

            // Glow effect
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 8;

            // Draw a dot or line? Line is better for timeline
            ctx.fillRect(x, 4, 3, height - 8);

            ctx.shadowBlur = 0;
        });

        // Draw Playhead
        const playheadX = (currentTime / duration) * width;

        ctx.fillStyle = "#E1F863"; // Neon Turn
        ctx.shadowColor = "#E1F863";
        ctx.shadowBlur = 10;
        ctx.fillRect(playheadX - 1, 0, 3, height);
        ctx.shadowBlur = 0;

    }, [issues, duration, currentTime]);

    return (
        <div className="w-full h-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden relative cursor-pointer hover:bg-white/10 transition-colors"
            onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const time = (x / rect.width) * duration;
                onSeek(time);
            }}>
            <canvas
                ref={canvasRef}
                width={600}
                height={48}
                className="w-full h-full"
            />
            <div className="absolute top-2 left-2 text-xs text-white/50 pointer-events-none">
                风险事件时间轴
            </div>
        </div>
    );
}
