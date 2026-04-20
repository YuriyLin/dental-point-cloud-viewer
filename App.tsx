import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import InteractiveViewer from './components/InteractiveViewer';
import Realize from './components/Realize';
import AIDemo from './components/AIDemo';
import Footer from './components/Footer';

function App() {
  const [segmentResult, setSegmentResult] = useState<any>(null);

  return (
    <main className="min-h-screen selection:bg-[#ffc93b]/30 selection:text-[#3c3c3c]">
      <Navbar />
      <Hero />

      {/* Brand Ethos / Banner */}
      <div className="bg-[#ffc93b] py-12">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
          <div className="flex whitespace-nowrap gap-24 animate-[marquee_30s_linear_infinite] text-2xl font-black text-[#3c3c3c]/30 uppercase tracking-[12px]">
            <span>Artificial Intelligence</span>
            <span>Precision Dentistry</span>
            <span>Modern Aesthetics</span>
            <span>Clinical Excellence</span>
            <span>Human-Centered Tech</span>
            <span>Artificial Intelligence</span>
            <span>Precision Dentistry</span>
            <span>Modern Aesthetics</span>
          </div>
        </div>
      </div>

      <Features />

      <Realize />

      <AIDemo onResult={setSegmentResult} />

      <InteractiveViewer
        key={`viewer-${segmentResult?.task_id || 'default'}`}
        taskId={segmentResult?.task_id}
      />

      {/* Trust Quote Section */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
          <div className="w-16 h-1 bg-[#ffc93b] mx-auto rounded-full"></div>
          <blockquote className="text-2xl md:text-3xl font-light italic text-[#3c3c3c] leading-relaxed">
            "巧醫的技術不僅是數位轉型，更是一種診間的溫度。它讓醫師與病患之間，多了一層清晰且值得信賴的連結。"
          </blockquote>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden shadow-sm">
              <img src="https://picsum.photos/id/64/100/100" alt="Doctor" />
            </div>
            <div className="font-bold text-[#3c3c3c]">林醫師</div>
            <div className="text-sm text-gray-400">知名連鎖牙醫診所 院長</div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto bg-[#3c3c3c] rounded-[40px] p-12 md:p-24 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffc93b]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff8538]/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

          <h2 className="text-4xl md:text-5xl font-bold text-white relative z-10">
            開啟您的 <span className="text-[#ffc93b]">數位美學</span> 之旅
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto relative z-10">
            加入全球數百家領先診所的行列，讓 AI 成為您最可靠的診療助手。
          </p>
          <div className="flex justify-center gap-4 pt-4 relative z-10">
            <a
              href="https://line.me/R/ti/p/@373qcikv?oat_content=url"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#ffc93b] text-[#3c3c3c] px-10 py-5 rounded-2xl font-bold hover:bg-[#ffb500] transition-all shadow-2xl shadow-yellow-500/20 active:scale-95 inline-block"
            >
              立即免費預約演示
            </a>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ffc93b;
        }
      `}</style>
    </main>
  );
}

export default App;
