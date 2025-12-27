import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AnalysisInputPage() {
    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center text-center">
            <Link href="/" className="absolute top-6 left-6 inline-flex items-center text-white/50 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
            </Link>
            <h1 className="text-2xl font-bold mb-4">视频上传功能即将上线</h1>
            <p className="text-white/60">我们正在准备核心分析引擎...</p>
        </div>
    );
}
