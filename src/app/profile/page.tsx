"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { UserProfile, PainProfile } from "@/lib/analysis/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, X, Plus } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { PainProfileComponent } from "@/components/PainProfile";
import { HeartPulse, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const SPORT_OPTIONS = [
    { id: 'running', label: '跑步', emoji: '🏃‍♂️' },
    { id: 'strength', label: '力量训练', emoji: '🏋️‍♀️' },
    { id: 'climbing', label: '攀岩', emoji: '🧗‍♀️' },
    { id: 'ball_sports', label: '球类', emoji: '🏀' },
    { id: 'others', label: '其他', emoji: '🧩' },
];

const WEIGHT_RANGES = [
    "<45kg", "45-50kg", "50-55kg", "55-60kg", "60-65kg", "65-70kg", "70-75kg", "75-80kg", "80-85kg", "85-90kg", ">90kg"
];

const HEIGHTS = Array.from({ length: 71 }, (_, i) => 140 + i);

export default function ProfilePage() {
    const router = useRouter();
    const { userProfile, setUserProfile } = useAppStore();
    const [isPainProfileOpen, setIsPainProfileOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<UserProfile>>({
        heightCm: 165,
        weightKg: "55-60kg",
        sportTypes: [],
        dominantSide: "right",
        injuryHistory: [],
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                ...userProfile,
                sportTypes: userProfile.sportTypes || [],
                dominantSide: userProfile.dominantSide || "right",
            });
        }
    }, [userProfile]);

    const handlePainProfileSave = (profile: PainProfile) => {
        setFormData(prev => ({ ...prev, painProfile: profile }));
        setIsPainProfileOpen(false);
    };

    const toggleSportType = (sportId: string) => {
        setFormData(prev => {
            const current = prev.sportTypes || [];
            if (current.includes(sportId)) {
                return { ...prev, sportTypes: current.filter(id => id !== sportId) };
            } else {
                return { ...prev, sportTypes: [...current, sportId] };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.heightCm) return;

        setUserProfile(formData as UserProfile);
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
            <div className="w-full max-w-md space-y-6">
                <Link href="/" className="inline-flex items-center text-white/50 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回首页
                </Link>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-white">
                        简历您的档案
                    </h1>
                    <p className="text-white/60">
                        为了提供准确的分析，我们需要了解您的基本信息。这些信息仅保存在您的设备上。
                    </p>
                </div>

                <Card className="bg-card border-white/5 text-white shadow-xl shadow-black/20 rounded-[24px] overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle>基本信息</CardTitle>
                            <CardDescription className="text-white/40">用于骨骼距离归一化和风险计算</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Height Selector */}
                            <div className="space-y-2">
                                <Label className="text-white/70">身高 (cm) *</Label>
                                <Select
                                    value={formData.heightCm?.toString()}
                                    onValueChange={(val) => setFormData({ ...formData, heightCm: Number(val) })}
                                >
                                    <SelectTrigger className="bg-secondary/10 border-white/5 text-white rounded-xl h-12 focus:ring-primary/20">
                                        <SelectValue placeholder="选择身高" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-stone-900 border-white/10 text-white max-h-[300px]">
                                        {HEIGHTS.map(h => (
                                            <SelectItem key={h} value={h.toString()}>{h} cm</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Weight range selector */}
                            <div className="space-y-2">
                                <Label className="text-white/70">体重区间</Label>
                                <Select
                                    value={formData.weightKg}
                                    onValueChange={(val) => setFormData({ ...formData, weightKg: val })}
                                >
                                    <SelectTrigger className="bg-secondary/10 border-white/5 text-white rounded-xl h-12 focus:ring-primary/20">
                                        <SelectValue placeholder="选择体重区间" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-stone-900 border-white/10 text-white">
                                        {WEIGHT_RANGES.map(range => (
                                            <SelectItem key={range} value={range}>{range}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator className="bg-white/5" />

                            {/* Sport Types Tagging */}
                            <div className="space-y-3">
                                <Label className="text-white/70">运动类型 (多选)</Label>
                                <div className="flex flex-wrap gap-2">
                                    {SPORT_OPTIONS.map(sport => {
                                        const isSelected = formData.sportTypes?.includes(sport.id);
                                        return (
                                            <button
                                                key={sport.id}
                                                type="button"
                                                onClick={() => toggleSportType(sport.id)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-full text-xs font-medium flex items-center transition-all",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-white/5 text-white/60 hover:bg-white/10"
                                                )}
                                            >
                                                <span className="mr-1.5">{sport.emoji}</span>
                                                {sport.label}
                                                {isSelected && (
                                                    <X className="ml-1.5 w-3 h-3 opacity-60" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Dominant Side */}
                            <div className="space-y-3">
                                <Label className="text-white/70">优势侧</Label>
                                <ToggleGroup
                                    type="single"
                                    value={formData.dominantSide}
                                    onValueChange={(val: any) => val && setFormData({ ...formData, dominantSide: val })}
                                    className="justify-start gap-2"
                                >
                                    <ToggleGroupItem value="left" className="flex-1 h-10 rounded-xl border-white/5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                        左侧
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="right" className="flex-1 h-10 rounded-xl border-white/5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                        右侧
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="uncertain" className="flex-1 h-10 rounded-xl border-white/5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                        不确定
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>

                            <Separator className="bg-white/5" />

                            {/* Pain Profile integration */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-white/80 flex items-center">
                                    <HeartPulse className="w-4 h-4 mr-2 text-red-400" />
                                    伤病与疼痛 (可选)
                                </Label>
                                <Dialog open={isPainProfileOpen} onOpenChange={setIsPainProfileOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full h-14 rounded-2xl border-white/5 bg-secondary/10 flex items-center justify-between px-4 hover:bg-secondary/20 transition-all group",
                                                formData.painProfile?.regions?.length ? "border-primary/30" : ""
                                            )}
                                        >
                                            <div className="flex items-center">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-colors",
                                                    formData.painProfile?.regions?.length ? "bg-primary/20 text-primary" : "bg-white/5 text-white/30"
                                                )}>
                                                    <HeartPulse className="w-5 h-5" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                                        记录疼痛历史
                                                    </div>
                                                    <div className="text-[10px] text-white/40 font-light">
                                                        {formData.painProfile?.regions?.length
                                                            ? `已记录 ${formData.painProfile.regions.length} 个区域`
                                                            : "记录伤病信息以获得更精准评估"}
                                                    </div>
                                                </div>
                                            </div>
                                            {formData.painProfile?.regions?.length ? (
                                                <CheckSquare className="w-5 h-5 text-primary" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border border-white/10" />
                                            )}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md bg-stone-950/95 border-white/10 backdrop-blur-2xl p-6 rounded-[24px]">
                                        <DialogHeader>
                                            <DialogTitle className="sr-only font-bold">编辑疼痛信息</DialogTitle>
                                        </DialogHeader>
                                        <PainProfileComponent
                                            initialData={formData.painProfile}
                                            onSave={handlePainProfileSave}
                                            onCancel={() => { }} // Dialog handles close
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4 bg-white/[0.02] border-t border-white/5 p-6">
                            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-bold h-12 shadow-[0_0_20px_rgba(225,248,99,0.2)] hover:shadow-[0_0_30px_rgba(225,248,99,0.4)] transition-all">
                                <Save className="w-4 h-4 mr-2" />
                                保存档案
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
