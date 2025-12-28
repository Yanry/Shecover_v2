"use client";

import { useEffect, useRef } from "react";
import { AssessmentIssue } from "@/lib/analysis/types";

interface TimelineProps {
    issues: { time: number; issues: AssessmentIssue[] }[];
    duration: number; // Video duration in seconds
    currentTime: number;
    onSeek: (time: number) => void;
    activeIssueId?: string | null;
    activeSegmentStart?: number | null;
}

export function RiskTimeline({ issues, duration, currentTime, onSeek, activeIssueId, activeSegmentStart }: TimelineProps) {
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

        // Draw Markers - Grouped into continuous segments
        const issueToSegments: Record<string, { start: number; end: number; risk: string }[]> = {};

        issues.forEach((entry) => {
            entry.issues.forEach(issue => {
                const segments = issueToSegments[issue.id] || [];
                const lastSegment = segments[segments.length - 1];

                // If this detection is within 0.5s of the last segment, extend it
                if (lastSegment && entry.time - lastSegment.end < 0.5) {
                    lastSegment.end = entry.time;
                    // Keep the highest risk level
                    if (issue.riskLevel === 'high') lastSegment.risk = 'high';
                } else {
                    segments.push({
                        start: entry.time,
                        end: entry.time,
                        risk: issue.riskLevel
                    });
                }
                issueToSegments[issue.id] = segments;
            });
        });

        // Loop through all issues and draw their segments
        Object.entries(issueToSegments).forEach(([issueId, segments]) => {
            const isIssueMatched = activeIssueId === issueId;

            segments.forEach(seg => {
                const isSegmentMatched = isIssueMatched &&
                    typeof activeSegmentStart === 'number' &&
                    Math.abs(seg.start - activeSegmentStart) < 0.01;

                const xStart = (seg.start / duration) * width;
                const xEnd = (seg.end / duration) * width;
                const markerWidth = Math.max(isSegmentMatched ? 4 : (isIssueMatched ? 3 : 2), xEnd - xStart);

                let markerColor = seg.risk === 'high' ? "#FF4444" : "#FACC15";

                if (isSegmentMatched) {
                    markerColor = seg.risk === 'high' ? "#FF6666" : "#E1F863"; // Brighter highlight
                    ctx.shadowBlur = 15;
                    ctx.globalAlpha = 1.0;
                } else if (isIssueMatched) {
                    // Other segments of the same issue are slightly dimmed compared to active one
                    ctx.shadowBlur = 4;
                    ctx.globalAlpha = 0.5;
                } else {
                    // Segments of other issues
                    ctx.shadowBlur = 6;
                    ctx.globalAlpha = 0.8;
                }

                ctx.fillStyle = markerColor;
                ctx.shadowColor = markerColor;

                // Draw segment
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(xStart, 4, markerWidth, height - 8, 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(xStart, 4, markerWidth, height - 8);
                }

                ctx.globalAlpha = 1.0; // Reset
            });
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
