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

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(0, 0, width, height);

        // Draw Markers
        issues.forEach((entry) => {
            if (entry.issues.length === 0) return;

            const x = (entry.time / duration) * width;

            // Color based on risk level
            const hasHighRisk = entry.issues.some(i => i.riskLevel === 'high');
            ctx.fillStyle = hasHighRisk ? "#EF4444" : "#EAB308"; // Red : Yellow

            // Draw a thin line
            ctx.fillRect(x, 0, 2, height);
        });

        // Draw Playhead
        const playheadX = (currentTime / duration) * width;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(playheadX - 1, 0, 2, height);

    }, [issues, duration, currentTime]);

    return (
        <div className="w-full h-12 bg-neutral-900 rounded-md overflow-hidden relative cursor-pointer"
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
