import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full px-6 pb-24">
      {/* Hero Section */}
      <section className="w-full max-w-5xl mt-32 flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary-500/30 text-sm text-primary-400 font-medium mb-4">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          Next Generation Platform
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 leading-tight pb-2">
          Trade with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 text-glow">unprecedented speed.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          Bekasi Stock Exchange is a next-generation trading platform built to deliver real-time market data, lightning-fast execution, and institutional-grade security right out of the box.
        </p>

        <div className="flex items-center gap-4 pt-8">
          <Link href="/login" className="px-8 py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-zinc-200 transition-all glow-primary">
            Get Started
          </Link>
          <a href="#features" className="px-8 py-4 rounded-xl glass text-white font-semibold text-lg hover:bg-surface-hover transition-all">
            Learn More
          </a>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="w-full max-w-5xl mt-40 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 glass p-10 flex flex-col justify-end min-h-[320px] group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-3xl font-bold text-white mb-4 z-10">Real-time Market Data</h3>
          <p className="text-zinc-400 text-lg z-10 max-w-md">
            Access ultra-low latency data feeds from global markets. Monitor your favorite assets with live price updates and advanced charting.
          </p>
        </div>

        <div className="col-span-1 glass p-10 flex flex-col justify-end min-h-[320px] group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-12 h-12 rounded-lg bg-accent-500/20 flex items-center justify-center mb-6 border border-accent-500/30">
            <div className="w-4 h-4 bg-accent-400 rounded-sm rotate-45 glow-accent" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 z-10">Advanced Tools</h3>
          <p className="text-zinc-400 z-10">
            Execute complex strategies with our professional-grade order types and risk management tools.
          </p>
        </div>

        <div className="col-span-1 glass p-10 flex flex-col justify-end min-h-[320px] group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
            <div className="w-4 h-4 bg-indigo-400 rounded-full glow-primary" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 z-10">Instant Execution</h3>
          <p className="text-zinc-400 z-10">
            Trade equities and derivatives with millisecond execution speeds directly from your dashboard.
          </p>
        </div>

        <div className="col-span-1 md:col-span-2 glass p-10 flex flex-col justify-end min-h-[320px] group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-3xl font-bold text-white mb-4 z-10">Institutional Grade Security</h3>
          <p className="text-zinc-400 text-lg z-10 max-w-md">
            Your assets are protected with state-of-the-art encryption, multi-factor authentication, and robust custody solutions.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-5xl mt-32 border-t border-surface-border pt-8 flex items-center justify-between text-zinc-500 text-sm">
        <p>&copy; 2026 Bekasi Stock Exchange. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
