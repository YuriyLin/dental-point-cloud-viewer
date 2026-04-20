
import React from 'react';

const Realize: React.FC = () => {
  return (
    <section id="realize" className="bg-[#3c3c3c] py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-[32px] md:text-[46px] font-bold text-white leading-tight tracking-premium">
            不白花大筆冤枉錢<br />
            <span className="text-[#ffc93b]">CHOiCE 讓你先瞭解、試過、再決定</span>
          </h2>
          <div className="w-24 h-1.5 bg-[#ffc93b] mx-auto rounded-full"></div>
        </div>

        <div className="flex justify-center">
          <div className="relative group max-w-4xl w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ffc93b] to-[#ff8538] rounded-[32px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-[32px] overflow-hidden shadow-2xl">
              {/* 模擬使用者提供的圖片效果 */}
              <img 
                src="https://smilechoice.tw/_nuxt/img/realize-1.25e4c03.png" 
                alt="CHOiCE Realize Demo" 
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2000";
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 底部波浪或裝飾元素 */}
      <div className="absolute bottom-0 left-0 right-0">
        <picture>
          <source media="(max-width: 767px)" srcSet="https://smilechoice.tw/_nuxt/img/steps-top_m.7f4c27b.png" />
          <img 
            src="https://smilechoice.tw/_nuxt/img/steps-top.e70fab4.png" 
            alt="Decorative Steps" 
            className="w-full h-auto opacity-20"
          />
        </picture>
      </div>

      {/* 背景光暈 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffc93b]/5 rounded-full blur-[120px]"></div>
    </section>
  );
};

export default Realize;
