import Link from "next/link";
import { ArrowRight, Activity, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden relative selection:bg-purple-500 selection:text-white">
      {/* Background Gradients - Theme Colors */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="z-10 flex flex-col items-center text-center px-6 max-w-4xl space-y-8">
        {/* Badge */}
        <div className="bg-white/10 text-white text-xs px-3 py-1 rounded-full border border-white/20 backdrop-blur-md uppercase tracking-widest font-medium">
          Powered by Mediapipe
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4">
          让身体的风险 <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary italic">
            可视化
          </span>
        </h1>

        <p className="text-lg text-white/60 max-w-2xl font-light leading-relaxed">
          基于 Google Mediapipe 的实时体态分析系统 <br />
          无需穿戴设备，仅需一段视频，即刻获得康复级建议。
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-8">
          <Link
            href="/analysis"
            className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-primary px-10 font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-[0_0_20px_rgba(225,248,99,0.3)] hover:shadow-[0_0_30px_rgba(225,248,99,0.5)]"
          >
            <span className="mr-2 text-lg">开始分析</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/profile"
            className="inline-flex h-14 items-center justify-center rounded-full border border-white/10 bg-card px-10 font-bold text-white transition-all hover:bg-white/10 hover:border-white/20"
          >
            完善档案
          </Link>
        </div>

        {/* Features Grid - Widget Style */}
        <div className="grid grid-cols-1 gap-4 w-full pt-12 text-left">
          <Link href="/analysis?mode=standing" className="block p-6 rounded-[24px] bg-card border border-white/5 active:scale-95 transition-all hover:border-primary/50 shadow-lg shadow-black/20 group">
            <div className="flex items-center space-x-5">
              <div className="p-4 rounded-2xl bg-secondary/10 text-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Activity className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">体态评估</h3>
                <p className="text-sm text-white/50 mt-1">
                  识别代偿模式并提供建议
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors" />
            </div>
          </Link>

          <Link href="/analysis?mode=climbing" className="block p-6 rounded-[24px] bg-card border border-white/5 active:scale-95 transition-all hover:border-primary/50 shadow-lg shadow-black/20 group">
            <div className="flex items-center space-x-5">
              <div className="p-4 rounded-2xl bg-secondary/10 text-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">攀岩风险检测</h3>
                <p className="text-sm text-white/50 mt-1">
                  动态分析失稳与摔落风险
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors" />
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
