"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { UserProfile } from "@/lib/analysis/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
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
import { PainProfile } from "@/lib/analysis/types";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const router = useRouter();
    const { userProfile, setUserProfile } = useAppStore();
    const [isPainProfileOpen, setIsPainProfileOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<UserProfile>>({
        heightCm: 170,
        weightKg: 60,
        trainingLevel: "intermediate",
        injuryHistory: [],
    });

    useEffect(() => {
        if (userProfile) {
            setFormData(userProfile);
        }
    }, [userProfile]);

    const handlePainProfileSave = (profile: PainProfile) => {
        setFormData(prev => ({ ...prev, painProfile: profile }));
        setIsPainProfileOpen(false);
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
                        建立您的档案
                    </h1>
                    <p className="text-white/60">
                        为了提供准确的分析，我们需要了解您的基本信息。这些信息仅保存在您的设备上。
                    </p>
                </div>

                <Card className="bg-card border-white/5 text-white shadow-xl shadow-black/20 rounded-[24px]">
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle>基本信息</CardTitle>
                            <CardDescription className="text-white/40">用于骨骼距离归一化和风险计算</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="height">身高 (cm) *</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    className="bg-secondary/10 border-white/5 text-white focus:border-primary/50 focus:ring-primary/20 rounded-xl h-12"
                                    value={formData.heightCm}
                                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weight">体重 (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    className="bg-secondary/10 border-white/5 text-white focus:border-primary/50 focus:ring-primary/20 rounded-xl h-12"
                                    value={formData.weightKg || ""}
                                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                                />
                            </div>

                            <Separator className="bg-white/5" />

                            <div className="space-y-2">
                                <Label htmlFor="level">训练水平</Label>
                                <Select
                                    value={formData.trainingLevel}
                                    onValueChange={(val: any) => setFormData({ ...formData, trainingLevel: val })}
                                >
                                    <SelectTrigger className="bg-secondary/10 border-white/5 text-white rounded-xl h-12 focus:ring-primary/20">
                                        <SelectValue placeholder="选择水平" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-white/5 text-white">
                                        <SelectItem value="beginner">新手 (0-1年)</SelectItem>
                                        <SelectItem value="intermediate">规律训练 (1-3年)</SelectItem>
                                        <SelectItem value="advanced">高阶 (3年以上)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator className="bg-white/5" />

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
                                                        记录疼痛史
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
                        <CardFooter className="pt-4">
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
