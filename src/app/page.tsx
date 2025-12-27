import Link from "next/link";
import { ArrowRight, Activity, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden relative selection:bg-purple-500 selection:text-white">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

      <main className="z-10 flex flex-col items-center text-center px-6 max-w-4xl space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-medium text-white/70">AI 驱动的动作分析</span>
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
          让身体的风险 <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            可视化
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed">
          专业的体态评估与运动损伤风险检测。
          <br className="hidden md:block" />
          无需穿戴设备，仅需一段视频，即刻获得康复级建议。
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
          <Link
            href="/analysis"
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-white px-8 font-medium text-black transition-all hover:bg-neutral-200"
          >
            <span className="mr-2">开始分析</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/profile"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
          >
            完善档案
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-4 w-full pt-8 text-left">
          <Link href="/analysis?mode=standing" className="block p-5 rounded-2xl bg-white/5 border border-white/10 active:scale-95 transition-all hover:bg-white/10 hover:border-white/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
                <Activity className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">体态评估</h3>
                <p className="text-xs text-white/50 mt-1">
                  识别代偿模式并提供建议
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/20" />
            </div>
          </Link>

          <Link href="/analysis?mode=climbing" className="block p-5 rounded-2xl bg-white/5 border border-white/10 active:scale-95 transition-all hover:bg-white/10 hover:border-white/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">攀岩风险检测</h3>
                <p className="text-xs text-white/50 mt-1">
                  动态分析失稳与摔落风险
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/20" />
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 text-xs text-white/30">
        MVP Version 1.0
      </footer>
    </div>
  );
}
