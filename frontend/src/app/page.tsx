import Link from 'next/link';
import { Sparkles, Map, Wallet, RefreshCw, Plane, ArrowRight, ShieldCheck, Globe2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col font-sans overflow-hidden transition-colors">
      {/* Navbar */}
      <nav className="w-full border-b border-gray-100 dark:border-gray-800/60 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md fixed top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-sm border border-blue-500">
              <Plane size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">AI Travel Planner</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold transition px-4 py-2 hidden sm:block">
              Log In
            </Link>
            <Link href="/register" className="bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 px-6 py-2.5 rounded-xl font-bold transition shadow-md hover:shadow-lg">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full pt-20">
        {/* Dynamic Hero Section */}
        <section className="relative w-full pt-24 lg:pt-36 pb-20 flex flex-col items-center justify-center text-center px-6 min-h-[90vh]">
          {/* Background Blobs for Glassmorphism */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-20 pointer-events-none">
            <div className="absolute top-0 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] animate-pulse"></div>
            <div className="absolute top-0 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute -bottom-10 left-32 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-300 text-sm font-bold mb-8 relative z-10 shadow-sm backdrop-blur-md">
             <Sparkles size={16} /> Powered by Vertex AI
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight lg:leading-[1.1] max-w-4xl relative z-10 mb-8">
            Plan your perfect getaway in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">seconds, not weeks.</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-12 relative z-10 font-medium">
            Ditch the spreadsheets. Our intelligent agent analyzes millions of data points to generate production-quality, deeply personalized itineraries with real-time budget management.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
            <Link 
              href="/register" 
              className="group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.8)] hover:shadow-[0_0_60px_-15px_rgba(37,99,235,1)] hover:-translate-y-0.5 w-full sm:w-auto text-center"
            >
              Start Planning for Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#features" 
              className="px-8 py-4 rounded-xl font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors w-full sm:w-auto text-center border border-gray-200 dark:border-gray-800"
            >
              See How It Works
            </Link>
          </div>
          
          {/* Dashboard Preview Mockup */}
          <div className="w-full max-w-5xl mt-24 relative z-10">
            <div className="w-full aspect-[16/9] bg-gray-900 rounded-3xl md:rounded-[2.5rem] border-8 border-white/50 dark:border-gray-800/50 shadow-2xl overflow-hidden flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')] bg-cover bg-center ring-1 ring-gray-200 dark:ring-gray-800">
               <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
               <div className="relative text-white text-center mt-auto pb-16 px-6">
                  <h3 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-lg">Your World, Curated.</h3>
                  <p className="text-gray-200 font-medium md:text-lg max-w-xl mx-auto drop-shadow-md">Say goodbye to travel stress. Experience the globe exactly the way you want to.</p>
               </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-white dark:bg-[#0a0a0a] relative z-10 border-t border-gray-100 dark:border-gray-800/60 transition-colors">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">Everything you need for seamless travel</h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg lg:text-xl font-medium">We've thought of everything so you don't have to. From dynamic budgets to micro-optimizations, the AI handles the heavy lifting.</p>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <FeatureCard 
                 icon={<Map className="text-emerald-600 dark:text-emerald-400" size={28} />}
                 title="Day-by-Day Generation"
                 desc="Receive highly structured, hour-aligned itineraries that logically make sense, complete with transportation guidance."
                 color="bg-emerald-50/50 dark:bg-emerald-950/20"
                 borderColor="border-emerald-100 dark:border-emerald-900/50"
                 iconBg="bg-emerald-100 dark:bg-emerald-900/40"
               />
               <FeatureCard 
                 icon={<RefreshCw className="text-indigo-600 dark:text-indigo-400" size={28} />}
                 title="Smart Day Replacer"
                 desc="Don't like a specific day? Click regenerate to swap it out while keeping the rest of your vacation perfectly intact."
                 color="bg-indigo-50/50 dark:bg-indigo-950/20"
                 borderColor="border-indigo-100 dark:border-indigo-900/50"
                 iconBg="bg-indigo-100 dark:bg-indigo-900/40"
               />
               <FeatureCard 
                 icon={<Wallet className="text-amber-600 dark:text-amber-400" size={28} />}
                 title="Budget Optimizer"
                 desc="Over budget? Our AI automatically analyzes expensive days and swaps activities for culturally authentic, cheaper substitutes."
                 color="bg-amber-50/50 dark:bg-amber-950/20"
                 borderColor="border-amber-100 dark:border-amber-900/50"
                 iconBg="bg-amber-100 dark:bg-amber-900/40"
               />
             </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-[#0a0a0a] py-12 border-t border-gray-200 dark:border-gray-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-6 md:mb-0">
            <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded-lg">
              <Plane size={18} className="text-gray-600 dark:text-gray-400" />
            </div>
            <span className="font-bold text-gray-700 dark:text-gray-300 text-lg tracking-tight">AI Travel Planner</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
             <Link href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Privacy Policy</Link>
             <Link href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color, borderColor, iconBg }: any) {
  return (
    <div className={`p-8 rounded-[2rem] border ${borderColor} ${color} flex flex-col gap-5 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 hover:-translate-y-2 group`}>
      <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300`}>
        {icon}
      </div>
      <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-lg">{desc}</p>
    </div>
  );
}
