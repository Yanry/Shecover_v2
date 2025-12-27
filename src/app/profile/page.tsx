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

export default function ProfilePage() {
    const router = useRouter();
    const { userProfile, setUserProfile } = useAppStore();
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

                <Card className="bg-white/5 border-white/10 text-white backdrop-blur-md">
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
                                    className="bg-black/20 border-white/10 text-white focus:border-purple-500"
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
                                    className="bg-black/20 border-white/10 text-white focus:border-purple-500"
                                    value={formData.weightKg || ""}
                                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                                />
                            </div>

                            <Separator className="bg-white/10" />

                            <div className="space-y-2">
                                <Label htmlFor="level">训练水平</Label>
                                <Select
                                    value={formData.trainingLevel}
                                    onValueChange={(val: any) => setFormData({ ...formData, trainingLevel: val })}
                                >
                                    <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                        <SelectValue placeholder="选择水平" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                        <SelectItem value="beginner">新手 (0-1年)</SelectItem>
                                        <SelectItem value="intermediate">规律训练 (1-3年)</SelectItem>
                                        <SelectItem value="advanced">高阶 (3年以上)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200 rounded-full font-medium">
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
