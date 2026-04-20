
import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 overflow-hidden">
            <img
              src="https://smilechoice.tw/_nuxt/img/logo.5b889da.png"
              alt="CHOICE 巧醫生技"
              className="h-full object-contain"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-xl tracking-tight text-[#3c3c3c]">巧醫生技</span>
          </div>
        </a>

        <div className="hidden md:flex gap-10 text-sm font-medium items-center">
          <a href="#" className="text-[#3c3c3c] hover:text-[#ffc93b] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#ffc93b] hover:after:w-full after:transition-all">核心技術</a>
          <a href="#" className="text-[#3c3c3c] hover:text-[#ffc93b] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#ffc93b] hover:after:w-full after:transition-all">產品服務</a>
          <a href="#" className="text-[#3c3c3c] hover:text-[#ffc93b] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#ffc93b] hover:after:w-full after:transition-all">學術合作</a>
          <a href="#" className="text-[#3c3c3c] hover:text-[#ffc93b] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#ffc93b] hover:after:w-full after:transition-all">關於我們</a>
        </div>

        <a
          href="https://smilechoice.tw/contact/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#ffc93b] hover:bg-[#ffb500] text-[#3c3c3c] font-bold px-7 py-3 rounded-xl transition-all shadow-lg shadow-yellow-200 active:scale-95 text-sm"
        >
          預約諮詢
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
