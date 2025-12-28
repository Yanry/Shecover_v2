"use client";

import React, { useState } from 'react';
import { PainProfile, PainRegion } from '@/lib/analysis/types';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    X,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    HelpCircle,
    Info,
    Check
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface PainProfileProps {
    initialData?: PainProfile;
    onSave: (data: PainProfile) => void;
    onCancel: () => void;
}

const REGION_LABELS: Record<PainRegion['bodyPart'], string> = {
    left_shoulder: '左肩',
    right_shoulder: '右肩',
    left_arm: '左臂',
    right_arm: '右臂',
    waist: '腰部',
    left_hip: '左髋',
    right_hip: '右髋',
    left_knee: '左膝',
    right_knee: '右膝',
    left_ankle: '左踝',
    right_ankle: '右踝',
};

export function PainProfileComponent({ initialData, onSave, onCancel }: PainProfileProps) {
    const [selectedRegions, setSelectedRegions] = useState<PainRegion[]>(initialData?.regions || []);
    const [isSaving, setIsSaving] = useState(false);

    const isRegionSelected = (part: PainRegion['bodyPart']) =>
        selectedRegions.some(r => r.bodyPart === part);

    const toggleRegion = (part: PainRegion['bodyPart']) => {
        if (isRegionSelected(part)) {
            setSelectedRegions(prev => prev.filter(r => r.bodyPart !== part));
        } else {
            setSelectedRegions(prev => [...prev, {
                bodyPart: part,
                painLevel: 'mild',
                diagnosed: false
            }]);
        }
    };

    const updateRegion = (part: PainRegion['bodyPart'], updates: Partial<PainRegion>) => {
        setSelectedRegions(prev => prev.map(r =>
            r.bodyPart === part ? { ...r, ...updates } : r
        ));
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate a small delay for feedback
        setTimeout(() => {
            onSave({
                regions: selectedRegions,
                lastUpdated: new Date().toISOString()
            });
            setIsSaving(false);
        }, 500);
    };

    return (
        <div className="flex flex-col space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar pr-2">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">疼痛历史与伤病记录</h2>
                    <p className="text-[10px] text-white/40 mt-1">点击人体部位进行标注</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-secondary/60">为什么要问这个?</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-white/5 hover:bg-white/10 text-white/40">
                                <HelpCircle className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent side="left" className="w-80 bg-stone-900 border-white/10 text-xs text-white/80 backdrop-blur-xl">
                            <p className="leading-relaxed">
                                我们记录这些信息是为了在进行损伤风险评估时，充分考虑您身体现有的薄弱环节。
                                这有助于我们为您提供个性化的安全指导，并根据您的身体状况支持更安全的训练。
                            </p>
                            <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-white/40">
                                您的数据将安全地存储在本地。
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Detailed Interactive Body Diagram */}
            <div className="relative w-full aspect-[4/5] max-w-[320px] mx-auto bg-stone-900/50 rounded-3xl border border-white/5 p-6 flex items-center justify-center shadow-inner">
                <svg viewBox="0 0 200 450" className="w-full h-full">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Common Body Outline - Base Layer */}
                    <path
                        d="M100,20 C110,20 120,25 120,45 C120,65 110,75 100,75 C90,75 80,65 80,45 C80,25 90,20 100,20 Z 
                           M100,75 L100,85 
                           M70,85 L130,85 
                           M70,85 C55,85 45,95 40,110 L25,180 C20,190 25,200 35,200 L45,200 L55,140 
                           M130,85 C145,85 155,95 160,110 L175,180 C180,190 175,200 165,200 L155,200 L145,140
                           M55,140 L55,220 C55,240 65,250 80,255 L100,255 L120,255 C135,250 145,240 145,220 L145,140
                           M70,255 L60,340 C55,360 60,370 75,370 L85,370 L95,255
                           M130,255 L140,340 C145,360 140,370 125,370 L115,370 L105,255
                           M70,370 L65,420 C63,430 70,435 80,435 L90,435 L95,370
                           M130,370 L135,420 C137,430 130,435 120,435 L110,435 L105,370"
                        fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="1"
                    />

                    {/* REGIONS */}

                    {/* Left Shoulder */}
                    <path
                        onClick={() => toggleRegion('left_shoulder')}
                        d="M70,85 C60,85 50,90 45,105 L55,130 L75,130 L85,85 Z"
                        fill={isRegionSelected('left_shoulder') ? 'rgba(255, 68, 68, 0.4)' : 'rgba(255,255,255,0.03)'}
                        stroke={isRegionSelected('left_shoulder') ? '#FF4444' : 'rgba(255,255,255,0.2)'}
                        strokeWidth="1" className="cursor-pointer hover:fill-red-500/20 transition-colors"
                        filter={isRegionSelected('left_shoulder') ? "url(#glow)" : ""}
                    />

                    {/* Right Shoulder */}
                    <path
                        onClick={() => toggleRegion('right_shoulder')}
                        d="M130,85 C140,85 150,90 155,105 L145,130 L125,130 L115,85 Z"
                        fill={isRegionSelected('right_shoulder') ? 'rgba(255, 68, 68, 0.4)' : 'rgba(255,255,255,0.03)'}
                        stroke={isRegionSelected('right_shoulder') ? '#FF4444' : 'rgba(255,255,255,0.2)'}
                        strokeWidth="1" className="cursor-pointer hover:fill-red-500/20 transition-colors"
                        filter={isRegionSelected('right_shoulder') ? "url(#glow)" : ""}
                    />

                    {/* Left Arm */}
                    <path
                        onClick={() => toggleRegion('left_arm')}
                        d="M45,110 L30,185 C28,195 35,200 45,200 L50,200 L55,135 Z"
                        fill={isRegionSelected('left_arm') ? 'rgba(255, 68, 68, 0.4)' : 'rgba(255,255,255,0.03)'}
                        stroke={isRegionSelected('left_arm') ? '#FF4444' : 'rgba(255,255,255,0.2)'}
                        strokeWidth="1" className="cursor-pointer hover:fill-red-500/20 transition-colors"
                    />

                    {/* Right Arm */}
                    <path
                        onClick={() => toggleRegion('right_arm')}
                        d="M155,110 L170,185 C172,195 165,200 155,200 L150,200 L145,135 Z"
                        fill={isRegionSelected('right_arm') ? 'rgba(255, 68, 68, 0.4)' : 'rgba(255,255,255,0.03)'}
                        stroke={isRegionSelected('right_arm') ? '#FF4444' : 'rgba(255,255,255,0.2)'}
                        strokeWidth="1" className="cursor-pointer hover:fill-red-500/20 transition-colors"
                    />

                    {/* Waist (Center) */}
                    <path
                        onClick={() => toggleRegion('waist')}
                        d="M75,145 L125,145 L120,210 L80,210 Z"
                        fill={isRegionSelected('waist') ? 'rgba(255, 68, 68, 0.4)' : 'rgba(255,255,255,0.03)'}
                        stroke={isRegionSelected('waist') ? '#FF4444' : 'rgba(255,255,255,0.2)'}
                        strokeWidth="1" className="cursor-pointer hover:fill-red-500/20 transition-colors"
                    />

                    {/* Left Hip */}
                    <path
                        onClick={() => toggleRegion('left_hip')}
                        d="M60,215 L100,215 L100,255 L75,255 C65,255 60,245 60,225 Z"
                        fill={isRegionSelected('left_hip') ? 'rgba(255, 68, 68, 0.4)' : 'rgba(255,255,255,0.03)'}
                        stroke={isRegionSelected('left_hip') ? '#FF4444' : 'rgba(255,255,255,0.2)'}
                        strokeWidth="1" className="cursor-pointer hover:fill-red-500/20 transition-colors"
                    />

                    {/* Right Hip */}
                    <path
                        onClick={() => toggleRegion('right_hip')}
                        d="M140,215 L100,215 L100,255 L125,255 C135,255 140,245 140,225 Z"
                        fill={isRegionSelected('right_hip') ? 'rgba(255, 68, 68, 0.4)' : 'rgba(255,255,255,0.03)'}
                        stroke={isRegionSelected('right_hip') ? '#FF4444' : 'rgba(255,255,255,0.2)'}
                        strokeWidth="1" className="cursor-pointer hover:fill-red-500/20 transition-colors"
                    />

                    {/* Left Knee (Separate Circle) */}
                    <circle
                        onClick={() => toggleRegion('left_knee')}
                        cx="77" cy="345" r="15"
                        fill={isRegionSelected('left_knee') ? 'rgba(255, 68, 68, 0.4)' : 'rgba(255,255,255,0.03)'}
                        stroke={isRegionSelected('left_knee') ? '#FF4444' : 'rgba(255,255,255,0.2)'}
                        strokeWidth="1" className="cursor-pointer hover:fill-red-500/20 transition-colors"
                    />

                    {/* Right Knee (Separate Circle) */}
                    <circle
                        onClick={() => toggleRegion('right_knee')}
                        cx="123" cy="345" r="15"
                        fill={isRegionSelected('right_knee') ? 'rgba(255, 68, 68, 0.4)' : 'rgba(255,255,255,0.03)'}
                        stroke={isRegionSelected('right_knee') ? '#FF4444' : 'rgba(255,255,255,0.2)'}
                        strokeWidth="1" className="cursor-pointer hover:fill-red-500/20 transition-colors"
                    />

                    {/* Left Ankle */}
                    <circle
                        onClick={() => toggleRegion('left_ankle')}
                        cx="75" cy="415" r="12"
                        fill={isRegionSelected('left_ankle') ? 'rgba(255, 68, 68, 0.4)' : 'rgba(255,255,255,0.03)'}
                        stroke={isRegionSelected('left_ankle') ? '#FF4444' : 'rgba(255,255,255,0.2)'}
                        strokeWidth="1" className="cursor-pointer hover:fill-red-500/20 transition-colors"
                    />

                    {/* Right Ankle */}
                    <circle
                        onClick={() => toggleRegion('right_ankle')}
                        cx="125" cy="415" r="12"
                        fill={isRegionSelected('right_ankle') ? 'rgba(255, 68, 68, 0.4)' : 'rgba(255,255,255,0.03)'}
                        stroke={isRegionSelected('right_ankle') ? '#FF4444' : 'rgba(255,255,255,0.2)'}
                        strokeWidth="1" className="cursor-pointer hover:fill-red-500/20 transition-colors"
                    />

                    {/* Labels for better orientation */}
                    <text x="100" y="105" textAnchor="middle" className="fill-white/10 text-[8px]">BODY MAP</text>
                </svg>
            </div>

            {/* Selected Details List */}
            <div className="space-y-4">
                {selectedRegions.length === 0 ? (
                    <div className="py-8 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
                        <AlertCircle className="h-8 w-8 text-white/20 mx-auto mb-2" />
                        <p className="text-sm text-white/40">点击上方示意图以添加疼痛或伤病区域</p>
                    </div>
                ) : (
                    selectedRegions.map((region) => (
                        <div key={region.bodyPart} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="px-4 py-3 bg-white/5 flex items-center justify-between">
                                <span className="font-medium text-sm text-white flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-red-500 mr-2 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                    {REGION_LABELS[region.bodyPart]}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg hover:bg-white/10 text-white/40"
                                    onClick={() => toggleRegion(region.bodyPart)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-white/60">疼痛程度</Label>
                                    <ToggleGroup
                                        type="single"
                                        value={region.painLevel}
                                        onValueChange={(val: any) => val && updateRegion(region.bodyPart, { painLevel: val })}
                                        className="justify-start gap-2"
                                    >
                                        <ToggleGroupItem value="mild" className="flex-1 h-9 rounded-xl border-white/5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">轻微</ToggleGroupItem>
                                        <ToggleGroupItem value="moderate" className="flex-1 h-9 rounded-xl border-white/5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">中度</ToggleGroupItem>
                                        <ToggleGroupItem value="severe" className="flex-1 h-9 rounded-xl border-white/5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">严重</ToggleGroupItem>
                                    </ToggleGroup>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <div className="space-y-0.5">
                                        <Label className="text-xs text-white/60">是否有临床诊断?</Label>
                                        <p className="text-[10px] text-white/30">例如 ACL 撕裂、踝关节扭伤等</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-white/40">{region.diagnosed ? '有' : '无'}</span>
                                        <Switch
                                            checked={region.diagnosed}
                                            onCheckedChange={(val) => updateRegion(region.bodyPart, { diagnosed: val })}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </div>
                                </div>

                                {region.diagnosed && (
                                    <div className="animate-in fade-in zoom-in-95">
                                        <Input
                                            placeholder="请输入详细病症 (可选)"
                                            value={region.diagnosisDetail || ''}
                                            onChange={(e) => updateRegion(region.bodyPart, { diagnosisDetail: e.target.value })}
                                            className="bg-white/5 border-white/10 h-10 rounded-xl text-xs focus:ring-primary/20"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )
                }
            </div>

            <div className="pt-6 flex space-x-3 sticky bottom-0 bg-black py-4 border-t border-white/10 z-10">
                <Button
                    variant="ghost"
                    className="flex-1 h-12 rounded-full border border-white/10 text-white/60"
                    onClick={() => {
                        setSelectedRegions([]);
                    }}
                >
                    全部清除
                </Button>
                <Button
                    className="flex-2 h-12 rounded-full bg-primary text-primary-foreground font-bold hover:shadow-[0_0_20px_rgba(225,248,99,0.3)] transition-all disabled:opacity-50"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? "正在保存..." : "确认保存"}
                </Button>
            </div>
        </div>
    );
}
