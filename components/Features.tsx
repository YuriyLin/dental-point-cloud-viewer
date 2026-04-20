import React from 'react';
import { Shield, Zap, Globe, HeartPulse, BrainCircuit, Users, Microscope, DatabaseZap } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <section className="py-32 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24 max-w-3xl mx-auto space-y-6">
          <div className="inline-block px-4 py-1.5 bg-[#ffc93b]/10 text-[#ff8538] font-bold rounded-full text-sm uppercase tracking-[0.2em] border border-[#ff8538]/20">
            Next-Gen Architecture
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#3c3c3c] leading-[1.2]">
            專為頂尖診所打造的 AI 分割系統
          </h2>
          <p className="text-gray-500 text-lg md:text-xl whitespace-nowrap">
            我們將繁瑣的影像標註流程轉化為瞬間的自動產出，大幅提升您的臨床工作效率與精準度。
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-10">

          {/* Card 1 - Large */}
          <div className="lg:col-span-8 bg-white p-10 md:p-14 rounded-[40px] shadow-xl shadow-gray-200/50 flex flex-col justify-between group hover:-translate-y-2 transition-transform duration-500">
            <div>
              <div className="w-16 h-16 bg-[#ffc93b]/10 rounded-2xl flex items-center justify-center text-[#ff8538] mb-8 group-hover:bg-[#ff8538] group-hover:text-white transition-all duration-300">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold text-[#3c3c3c] mb-4">超精度 3D 分割模型</h3>
              <p className="text-gray-500 text-lg leading-relaxed max-w-md">
                基於數十萬筆真實亞洲人口內掃描資料，自主研發的 Deep Learning 點雲神經網路模型，0.2 秒內精準識別並分離全口三十餘顆獨立齒列與牙齦組織。
              </p>
            </div>
            <div className="mt-12 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#ffc93b] to-[#ff8538] w-[95%]"></div>
            </div>
          </div>

          {/* Card 2 - Vertical */}
          <div className="lg:col-span-4 bg-[#3c3c3c] p-10 md:p-14 rounded-[40px] shadow-xl shadow-gray-900/20 text-white flex flex-col justify-between group hover:-translate-y-2 transition-transform duration-500">
            <div>
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-[#ffc93b] mb-8 pb-1">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">臺灣製造 即時解套</h3>
              <p className="text-gray-300 leading-relaxed">
                MIT 專業級隱形牙套解決方案。從模型建置到列印成型皆在本土完成，如遇破損或遺失，保證 48 小時內即時重製配送，確保病患療程絕不延誤。
              </p>
            </div>
          </div>

          {/* Card 3 - Small */}
          <div className="lg:col-span-5 bg-white p-10 rounded-[40px] shadow-lg shadow-gray-200/50 group hover:-translate-y-2 transition-transform duration-500">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-14 h-14 bg-blue-50/50 rounded-full flex items-center justify-center text-blue-500 border border-blue-100">
                <Microscope className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-[#3c3c3c]">FDA 專利醫材</h3>
            </div>
            <p className="text-gray-500 leading-relaxed">
              全面整合美國 FDA 認證的專利醫材軟體 PlaniMax，依據臺灣矯正與重建專科標準，給出最符合生理機制的排牙設計。
            </p>
          </div>

          {/* Card 4 - Horizontal Wide */}
          <div className="lg:col-span-7 bg-white p-10 rounded-[40px] shadow-lg shadow-gray-200/50 group hover:-translate-y-2 transition-transform duration-500 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
              <DatabaseZap className="w-64 h-64 text-[#ffc93b]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-14 h-14 bg-green-50/50 rounded-full flex items-center justify-center text-green-500 border border-green-100">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-[#3c3c3c]">CHOiCE 智能化評估報告</h3>
              </div>
              <p className="text-gray-500 leading-relaxed max-w-lg mb-6">
                只需一次掃描，系統將自動生成專屬於病患的圖文並茂的矯正分析報告。幫助醫師在第一次諮詢時，就能提供最精緻的視覺化說明。
              </p>
              <a href="#demo-section" className="inline-flex items-center font-bold text-[#ff8538] hover:text-[#ffc93b] transition-colors">
                前往體驗 AI 預測模型 &rarr;
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;
