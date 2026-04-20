
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 z-10">
          <div className="inline-block px-4 py-1.5 bg-[#ffc93b]/10 text-[#ff8538] font-bold rounded-full text-xs uppercase tracking-premium">
            AI-Powered Dental Future
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-[#3c3c3c]">
            重新定義 <br />
            <span className="text-[#ffc93b]">數位牙科</span> 的無限可能
          </h1>
          <p className="text-lg text-[#424242] max-w-lg leading-relaxed">
            巧醫生技結合頂尖人工智慧與美學工藝，為牙醫師提供毫秒級的自動影像分割與分析，讓每一次診療都精準、高效、充滿溫暖。
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#3c3c3c] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#4a4a4a] transition-all shadow-xl shadow-gray-200"
            >
              即刻體驗 AI 辨識
            </button>
            <button
              onClick={() => document.getElementById('realize')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-[#3c3c3c] text-[#3c3c3c] px-8 py-4 rounded-lg font-bold hover:bg-gray-50 transition-all"
            >
              了解解決方案
            </button>
          </div>

          <div className="flex items-center gap-8 pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#3c3c3c]">98.6%</div>
              <div className="text-sm text-gray-500">標註準確度</div>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#3c3c3c]">0.2s</div>
              <div className="text-sm text-gray-500">處理速度</div>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#3c3c3c]">500+</div>
              <div className="text-sm text-gray-500">合作診所</div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-tr from-[#ffc93b]/30 to-[#ff8538]/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative rounded-[40px] overflow-hidden shadow-2xl animate-float">
            <img
              src="https://smilechoice.tw/_nuxt/img/form-dress-1.584bbbd.jpg"
              alt="Dental Technology"
              className="w-full aspect-square object-cover"
            />
            <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ffc93b] rounded-full flex items-center justify-center text-white text-xl">✨</div>
                <div>
                  <div className="font-bold text-[#3c3c3c]">AI 即時分割技術</div>
                  <div className="text-xs text-gray-500">以牙齒辨識為核心的高準確度模型</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background patterns */}
      <div className="absolute top-20 right-[-5%] w-[400px] h-[400px] bg-[#ffc93b]/5 rounded-full -z-10 blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-[#ff8538]/5 rounded-full -z-10 blur-3xl"></div>
    </section>
  );
};

export default Hero;
