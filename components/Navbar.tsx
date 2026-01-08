
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-center items-center">
        <div className="flex items-center">
          <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
            SIGNATURE <span className="text-[#FDCD1F] drop-shadow-sm">DE</span>
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
