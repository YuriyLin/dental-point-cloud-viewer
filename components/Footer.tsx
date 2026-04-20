
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#3c3c3c] text-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <img
              src="https://smilechoice.tw/_nuxt/img/logo-w.d6547c3.png"
              alt="CHOICE Logo"
              className="h-12 brightness-0 invert"
            />
            <p className="text-gray-400 max-w-sm leading-relaxed">
              巧醫生技致力於透過 AI 技術提升全球口腔醫療品質。我們相信科技應帶有溫度，讓笑容更有自信。
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ffc93b] hover:text-[#3c3c3c] transition-all cursor-pointer">In</div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ffc93b] hover:text-[#3c3c3c] transition-all cursor-pointer">Fb</div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ffc93b] hover:text-[#3c3c3c] transition-all cursor-pointer">Ig</div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-lg">快速連結</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">產品介紹</a></li>
              <li><a href="#" className="hover:text-white transition-colors">學術資源</a></li>
              <li><a href="#" className="hover:text-white transition-colors">合作夥伴</a></li>
              <li><a href="#" className="hover:text-white transition-colors">服務據點</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-lg">聯絡我們</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>臺南市新市區南科三路13號</li>
              <li>service@choice.com</li>
              <li>06-505-7289</li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <p>© 2026 巧醫生技股份有限公司 CHOICE Biotech Co., Ltd. 版權所有</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">隱私權政策</a>
            <a href="#" className="hover:text-white transition-colors">使用條款</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
