"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { VideoUploader } from "@/components/VideoUploader";
import { PoseVisualizer } from "@/components/PoseVisualizer";
import { RiskTimeline } from "@/components/RiskTimeline";
import { PostureEngine } from "@/lib/analysis/engine";
import { PoseLandmarks, AssessmentIssue } from "@/lib/analysis/types";
import { analyzeNaturalStanding } from "@/lib/analysis/modules/standing";
import { analyzeSingleLegStance } from "@/lib/analysis/modules/single_leg";
import { analyzeWalking } from "@/lib/analysis/modules/walking";
import { analyzeSquat } from "@/lib/analysis/modules/squat";
import { analyzeOverhead } from "@/lib/analysis/modules/overhead";
import { analyzeClimbing } from "@/lib/analysis/modules/climbing";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, ArrowLeft, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import Link from "next/link";

type AnalysisMode = 'standing' | 'single_leg' | 'walking' | 'squat' | 'overhead' | 'climbing';

function AnalysisContent() {
    const searchParams = useSearchParams();
    const initialMode = (searchParams.get('mode') as AnalysisMode) || 'standing';

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [landmarks, setLandmarks] = useState<PoseLandmarks | null>(null);
    const [engine, setEngine] = useState<PostureEngine | null>(null);
    const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
    const [mode, setMode] = useState<AnalysisMode>(initialMode);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Real-time issues state
    const [currentIssues, setCurrentIssues] = useState<AssessmentIssue[]>([]);

    // History for timeline
    const [issueHistory, setIssueHistory] = useState<{ time: number; issues: AssessmentIssue[] }[]>([]);

    // Interactive navigation state
    const [issueClickCounts, setIssueClickCounts] = useState<Record<string, number>>({});
    const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
    const [activeSegmentStart, setActiveSegmentStart] = useState<number | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const requestRef = useRef<number | null>(null);

    // Use a ref to hold the current mode
    const modeRef = useRef(mode);
    useEffect(() => {
        modeRef.current = mode;
        // Reset history when mode changes
        setIssueHistory([]);
        setCurrentIssues([]);
        setIssueClickCounts({});
        setActiveIssueId(null);
        setActiveSegmentStart(null);
    }, [mode]);

    // 1. Initialize Engine
    useEffect(() => {
        const newEngine = new PostureEngine();
        newEngine.setOnResults((results) => {
            setLandmarks(results);

            let issues: AssessmentIssue[] = [];
            const currentMode = modeRef.current;

            switch (currentMode) {
                case 'standing': issues = analyzeNaturalStanding(results); break;
                case 'single_leg': issues = analyzeSingleLegStance(results); break;
                case 'walking': issues = analyzeWalking(results); break;
                case 'squat': issues = analyzeSquat(results); break;
                case 'overhead': issues = analyzeOverhead(results); break;
                case 'climbing': issues = analyzeClimbing(results); break;
                default: issues = [];
            }

            // Accumulate issues: Only add if not already present
            if (issues.length > 0) {
                setCurrentIssues(prev => {
                    const newIssues = [...prev];
                    issues.forEach(newIssue => {
                        const exists = prev.some(existing => existing.id === newIssue.id);
                        if (!exists) {
                            newIssues.push(newIssue);
                        }
                    });
                    return newIssues;
                });

                // Record history if video is playing
                if (videoRef.current && !videoRef.current.paused) {
                    const t = videoRef.current.currentTime;
                    setIssueHistory(prev => [...prev, { time: t, issues }]);
                }
            }
        });
        setEngine(newEngine);

        return () => {
            newEngine.close();
        };
    }, []);

    // 2. Handle Video File Selection
    useEffect(() => {
        if (videoFile) {
            const url = URL.createObjectURL(videoFile);
            setVideoUrl(url);
            setIssueHistory([]); // Reset history
            setCurrentIssues([]); // Reset current issues
            setIssueClickCounts({}); // Reset clicks
            setActiveIssueId(null); // Reset highlight
            setActiveSegmentStart(null); // Reset segment highlight
            return () => URL.revokeObjectURL(url);
        }
    }, [videoFile]);

    // 3. Frame Processing Loop
    const processFrame = async () => {
        if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended && engine) {
            await engine.processFrame(videoRef.current);
            setCurrentTime(videoRef.current.currentTime);
            requestRef.current = requestAnimationFrame(processFrame);
        }
    };

    // 4. Handle Playback
    useEffect(() => {
        if (isPlaying) {
            videoRef.current?.play();
            requestRef.current = requestAnimationFrame(processFrame);
        } else {
            videoRef.current?.pause();
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        }
    }, [isPlaying, engine]);

    const togglePlay = () => setIsPlaying(!isPlaying);

    const handleVideoLoaded = () => {
        if (videoRef.current) {
            setVideoDimensions({
                width: videoRef.current.videoWidth,
                height: videoRef.current.videoHeight
            });
            setDuration(videoRef.current.duration);
        }
    }

    const handleSeek = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);

            // On seek, if paused, process one frame immediately to update skeleton
            if (!isPlaying && engine) {
                // We use a slight delay to ensure the video has actually seeked to the new frame
                setTimeout(() => {
                    if (videoRef.current) engine.processFrame(videoRef.current);
                }, 40);
            }
        }
    }

    const jumpToIssueOccurrence = (issueId: string) => {
        // 1. Group occurrences into continuous segments (within 0.5s of each other)
        const entries = issueHistory.filter(h => h.issues.some(i => i.id === issueId));
        if (entries.length === 0) return;

        const segments: number[] = [];
        let currentSegmentStart = entries[0].time;
        segments.push(currentSegmentStart);

        for (let i = 1; i < entries.length; i++) {
            // If the gap between detections is > 0.5s, consider it a new segment
            if (entries[i].time - entries[i - 1].time > 0.5) {
                segments.push(entries[i].time);
            }
        }

        // 2. Cycle through the segments
        const currentCount = issueClickCounts[issueId] || 0;
        const nextIndex = currentCount % segments.length;
        const targetTime = segments[nextIndex];

        handleSeek(targetTime);
        setActiveIssueId(issueId);
        setActiveSegmentStart(targetTime);

        // Update click count
        setIssueClickCounts(prev => ({
            ...prev,
            [issueId]: currentCount + 1
        }));
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Sticky Mobile Header - Glass Effect */}
            <div className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between supports-[backdrop-filter]:bg-black/10">
                <Link href="/" className="inline-flex items-center text-white/90 hover:text-primary transition-colors p-2 hover:bg-white/10 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                <Select value={mode} onValueChange={(v: AnalysisMode) => setMode(v)}>
                    <SelectTrigger className="w-auto min-w-[140px] max-w-[180px] h-9 bg-white/10 border-white/20 text-white text-xs backdrop-blur-md hover:bg-white/20 transition-all rounded-full px-4">
                        <SelectValue placeholder="分析模式" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl" align="end">
                        <SelectItem value="standing">自然站立</SelectItem>
                        <SelectItem value="single_leg">单腿站立</SelectItem>
                        <SelectItem value="walking">自然步行</SelectItem>
                        <SelectItem value="squat">双脚深蹲</SelectItem>
                        <SelectItem value="overhead">手臂上举</SelectItem>
                        <SelectItem value="climbing">攀岩模式 (Beta)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <main className="flex-1 flex flex-col p-4 gap-6 w-full max-w-6xl mx-auto portrait:p-2 portrait:gap-4">

                {/* 1. Video Area */}
                {!videoUrl ? (
                    <div className="mt-8">
                        <VideoUploader onVideoSelect={setVideoFile} />
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {/* Player */}
                        <div
                            className="relative w-full mx-auto bg-black/40 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 
                                       portrait:max-h-[60vh] landscape:max-h-[75vh]"
                            style={{
                                aspectRatio: videoDimensions.width > 0 ? `${videoDimensions.width} / ${videoDimensions.height}` : '16/9'
                            }}
                        >
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                className="w-full h-full object-contain"
                                onLoadedMetadata={handleVideoLoaded}
                                onEnded={() => setIsPlaying(false)}
                                onTimeUpdate={() => {
                                    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                                }}
                                playsInline
                                muted
                            />

                            {/* Overlay */}
                            {videoDimensions.width > 0 && (
                                <div className="absolute inset-0 w-full h-full pointer-events-none">
                                    <PoseVisualizer
                                        landmarks={landmarks}
                                        width={videoDimensions.width}
                                        height={videoDimensions.height}
                                        currentIssues={currentIssues}
                                    />
                                </div>
                            )}


                            {/* Play Controls Overlay - Glass Bar */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg pointer-events-auto hover:bg-white/20 transition-all">
                                <Button onClick={() => {
                                    if (videoRef.current) {
                                        videoRef.current.currentTime = 0;
                                        setIsPlaying(true);
                                        setCurrentIssues([]);
                                        setIssueHistory([]);
                                    }
                                }} variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-transparent rounded-full w-10 h-10">
                                    <RotateCcw className="w-5 h-5" />
                                </Button>

                                <Button onClick={togglePlay} variant="ghost" size="icon" className="rounded-full w-12 h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-1 fill-current" />}
                                </Button>
                            </div>
                        </div>

                        {/* Risk Timeline - Always visible */}
                        <RiskTimeline
                            issues={issueHistory}
                            duration={duration}
                            currentTime={currentTime}
                            onSeek={handleSeek}
                            activeIssueId={activeIssueId}
                            activeSegmentStart={activeSegmentStart}
                        />

                        {/* 2. Analysis Report - Glass Card */}
                        <Card className="bg-white/10 border-white/20 text-white backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden mt-2">
                            <CardHeader className="pb-3 border-b border-white/10 bg-white/5">
                                <CardTitle className="flex items-center space-x-2 text-base font-medium">
                                    {mode === 'climbing' ? <Activity className="w-4 h-4 text-primary" /> : <AlertTriangle className="w-4 h-4 text-primary" />}
                                    <span className="text-white/90">{mode === 'climbing' ? '风险记录' : '体态报告'}</span>
                                    {currentIssues.length > 0 && (
                                        <span className="ml-auto text-xs font-mono bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                                            {currentIssues.length} ISSUES
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 max-h-[300px] overflow-y-auto space-y-3 custom-scrollbar">
                                {currentIssues.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-white/30 space-y-2">
                                        <Activity className="w-8 h-8 opacity-20" />
                                        <div className="text-sm font-light">
                                            {isPlaying ? "正在分析体态..." : "等待播放视频..."}
                                        </div>
                                    </div>
                                ) : (
                                    currentIssues.map((issue, idx) => (
                                        <div
                                            key={`${issue.id}-${idx}`}
                                            onClick={() => jumpToIssueOccurrence(issue.id)}
                                            className={`p-4 rounded-xl border transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${activeIssueId === issue.id
                                                ? 'bg-primary/20 border-primary/40 ring-1 ring-primary/30'
                                                : 'bg-black/20 border-white/10 hover:bg-black/30 hover:border-white/20'
                                                } space-y-2 animate-in fade-in slide-in-from-bottom-2`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-medium text-white text-sm">{issue.name}</h3>
                                                <span className={`text-[10px] px-2 py-1 rounded-full font-mono uppercase tracking-wider ${issue.riskLevel === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                                                    }`}>
                                                    {issue.riskLevel === 'high' ? 'High Risk' : 'Medium Risk'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-white/60 leading-relaxed">{issue.description}</p>
                                            <div className="flex items-start space-x-2 pt-1 border-t border-white/5 mt-2">
                                                <CheckCircle className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                                                <p className="text-[10px] text-white/50 font-light">{issue.suggestion}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function AnalysisPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
            <AnalysisContent />
        </Suspense>
    );
}
