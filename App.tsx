
import React, { useState, useRef } from 'react';
import { SignatureData, BRAND_COLORS } from './types';
import SignaturePreview from './components/SignaturePreview';
import Controls from './components/Controls';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [data, setData] = useState<SignatureData>({
    name: 'Anna Sumiyati',
    title: 'Graphic Designer',
    description: 'Yaratıcı çözümler sunan profesyonel tasarımcı.',
    phone1: '0555 123 45 67',
    phone2: '',
    email: 'info@de-osgb.com',
    website: 'www.de-osgb.com',
    addressLine1: 'İstanbul, Türkiye',
    addressLine2: '',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    logoUrl: '', 
    brandColor: '#FDCD1F',
    socials: {
      youtube: '#',
      instagram: '#',
      linkedin: '#'
    }
  });

  const [copySuccess, setCopySuccess] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleUpdate = (newData: any) => {
    // Link düzeltme: www. ile başlayanları https:// ile tamamla
    if (newData.photoUrl && newData.photoUrl.startsWith('www.')) {
      newData.photoUrl = 'https://' + newData.photoUrl;
    }
    if (newData.logoUrl && newData.logoUrl.startsWith('www.')) {
      newData.logoUrl = 'https://' + newData.logoUrl;
    }
    setData(prev => ({ ...prev, ...newData }));
  };

  const copyToClipboard = async () => {
    if (!previewRef.current) return;
    
    try {
      let html = previewRef.current.innerHTML;
      
      // Gmail ve Outlook için HTML temizliği
      html = html
        .replace(/\s+/g, ' ') 
        .replace(/>\s+</g, '><') 
        .replace(/ data-reactroot=""/g, '')
        .replace(/<!--.*?-->/g, '')
        .trim();

      const blob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([previewRef.current.innerText], { type: 'text/plain' });
      
      const dataItem = new ClipboardItem({ 
        'text/html': blob,
        'text/plain': textBlob
      });
      
      await navigator.clipboard.write([dataItem]);
      
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Kopyalama başarısız. Lütfen imzayı fare ile seçip manuel kopyalayın.');
    }
  };

  const isBase64 = data.photoUrl.startsWith('data:') || data.logoUrl.startsWith('data:');

  return (
    <div className="min-h-screen flex flex-col selection:bg-rose-100 bg-slate-50">
      <Navbar />
      
      <main className="flex-1 max-w-[1400px] mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: data.brandColor }}></span>
                Tasarım Paneli
              </h2>
              <div className="flex gap-2 bg-slate-800 p-1.5 rounded-full">
                {BRAND_COLORS.map(color => (
                  <button
                    key={color.code}
                    onClick={() => handleUpdate({ brandColor: color.code })}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${data.brandColor === color.code ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color.code }}
                  />
                ))}
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <Controls data={data} onUpdate={handleUpdate} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 lg:p-8 flex flex-col min-h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Canlı Önizleme</h2>
                <p className="text-sm text-slate-400 font-medium">Ayarlara yapıştırmak için kopyalayın.</p>
              </div>
              
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <button
                  onClick={copyToClipboard}
                  className={`px-8 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg ${
                    copySuccess 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                  }`}
                >
                  <i className={`fas ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
                  {copySuccess ? 'Kopyalandı!' : 'İmzayı Kopyala'}
                </button>
                {isBase64 && (
                  <span className="text-[10px] text-amber-600 font-bold animate-pulse text-center">
                    ⚠️ Yüklü görsel karakter sayısını artırıyor!
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 p-4 md:p-12 flex justify-center items-center overflow-auto min-h-[400px]">
              <div className="inline-block transform origin-center max-w-full">
                {/* Önizleme alanı da kırık beyaz tonunda */}
                <div ref={previewRef} className="bg-[#FAFAFA] shadow-sm border border-slate-100">
                  <SignaturePreview data={data} />
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-slate-900 p-5 rounded-2xl flex flex-col sm:flex-row items-start gap-4 border border-slate-100 shadow-sm" style={{ backgroundColor: `${data.brandColor}10` }}>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                <i className="fas fa-exclamation-triangle text-xs" style={{ color: data.brandColor }}></i>
              </div>
              <div className="text-xs">
                <p className="font-bold mb-1">Görseller Görünmüyorsa:</p>
                <ul className="list-disc ml-4 space-y-1 text-slate-600 font-medium">
                  <li>Eklediğiniz linkin <b>doğrudan resim dosyasına</b> (.jpg, .png gibi) gittiğinden emin olun.</li>
                  <li>Google Drive linkleri doğrudan resim linki değildir, çalışmayabilir.</li>
                  <li>Linkler mutlaka <b>https://</b> ile başlamalıdır.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
