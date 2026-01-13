
import React, { useState, useEffect } from 'react';
import { SignatureData } from '../types';

interface InputGroupProps {
  label: string;
  name: string;
  value: string;
  onUpdate: (data: Partial<SignatureData>) => void;
  type?: string;
  placeholder?: string;
}

const InputGroup = React.memo(({ label, name, value, onUpdate, type = 'text', placeholder = '' }: InputGroupProps) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onUpdate({ [name]: e.target.value })}
      className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-[#FDCD1F] outline-none transition-all text-sm text-white placeholder-slate-500"
    />
  </div>
));

interface ControlsProps {
  data: SignatureData;
  onUpdate: (data: Partial<SignatureData>) => void;
}

const Controls: React.FC<ControlsProps> = ({ data, onUpdate }) => {
  const [rawFile, setRawFile] = useState<File | null>(null);

  // Renk değiştiğinde yeniden render et
  useEffect(() => {
    if (rawFile && data.brandColor) {
      processAndBakeImage(rawFile, data.brandColor).then((base64) => {
        onUpdate({ photoUrl: base64 });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.brandColor]);

  const processAndBakeImage = (file: File, color: string): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          // --- AYARLAR ---
          const scale = 4; // Çok yüksek kalite
          const totalWidth = 95 * scale;
          const totalHeight = 125 * scale;
          
          const outerRadius = 55 * scale;
          const gap = 5 * scale; 

          canvas.width = totalWidth;
          canvas.height = totalHeight;

          // 1. ADIM: ZEMİNİ İMZA RENGİNE BOYA (#FAFAFA)
          // Bu adım Outlook'ta dikdörtgen görünme sorununu çözer. 
          // Şeffaf alan bırakmak yerine imza zemin rengiyle dolduruyoruz.
          // Böylece resim dikdörtgen olsa bile köşeler zeminle kaynaşır.
          ctx.fillStyle = '#FAFAFA'; 
          ctx.fillRect(0, 0, totalWidth, totalHeight);

          // 2. ADIM: RENKLİ DIŞ ÇERÇEVE
          drawDShape(ctx, 0, 0, totalWidth, totalHeight, outerRadius);
          ctx.fillStyle = color;
          ctx.fill();

          // 3. ADIM: BEYAZ BOŞLUK (GAP)
          drawDShape(
            ctx, 
            gap, gap, 
            totalWidth - gap * 2, 
            totalHeight - gap * 2, 
            outerRadius - gap
          );
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          // 4. ADIM: RESMİ MASKELE VE ÇİZ
          ctx.save();
          drawDShape(
            ctx, 
            gap, gap, 
            totalWidth - gap * 2, 
            totalHeight - gap * 2, 
            outerRadius - gap
          );
          ctx.clip(); // Maskeleme

          // Resmi yerleştir (Cover mantığı)
          const drawW = totalWidth - gap * 2;
          const drawH = totalHeight - gap * 2;
          
          let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
          const imgRatio = img.width / img.height;
          const targetRatio = drawW / drawH;

          if (imgRatio > targetRatio) {
            sourceWidth = img.height * targetRatio;
            sourceX = (img.width - sourceWidth) / 2;
          } else {
            sourceHeight = img.width / targetRatio;
            sourceY = (img.height - sourceHeight) / 2;
          }

          ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, gap, gap, drawW, drawH);
          ctx.restore();

          // Çıktıyı al
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const drawDShape = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y); 
    ctx.lineTo(x + w - r, y); 
    ctx.quadraticCurveTo(x + w, y, x + w, y + r); 
    ctx.lineTo(x + w, y + h - r); 
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); 
    ctx.lineTo(x, y + h); 
    ctx.lineTo(x, y); 
    ctx.closePath();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'logoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      if (field === 'photoUrl') {
        setRawFile(file);
        const processedBase64 = await processAndBakeImage(file, data.brandColor);
        onUpdate({ [field]: processedBase64 });
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => ev.target?.result && onUpdate({ [field]: ev.target.result as string });
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xs font-bold text-slate-500 mb-4 border-b border-slate-800 pb-2 flex items-center gap-2 uppercase">
          <i className="fas fa-image text-[#FDCD1F]"></i> Görsel ve Logo
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Profil Resmi</label>
            <div className="relative group h-20 bg-slate-800 rounded-xl border border-dashed border-slate-700 overflow-hidden flex items-center justify-center hover:border-[#FDCD1F] transition-colors">
              <img src={data.photoUrl && data.photoUrl.startsWith('data:') ? data.photoUrl : 'https://placehold.co/100x100/333/666?text=?'} className="w-full h-full object-contain bg-[#FAFAFA]" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-bold text-center p-2 uppercase cursor-pointer">
                Dosya Seç (Tam Birleştirme)
              </div>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileUpload(e, 'photoUrl')} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Logo</label>
            <div className="relative group h-20 bg-slate-800 rounded-xl border border-dashed border-slate-700 overflow-hidden flex items-center justify-center hover:border-[#FDCD1F] transition-colors p-2">
              {data.logoUrl ? <img src={data.logoUrl} className="max-w-full max-h-full object-contain" /> : <i className="fas fa-plus text-slate-600"></i>}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-bold text-center p-2 uppercase cursor-pointer">
                Dosya Seç
              </div>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
            </div>
          </div>
        </div>

        <InputGroup label="Fotoğraf Linki (URL)" name="photoUrl" value={data.photoUrl.startsWith('data:') ? 'Görsel işlendi (Base64)' : data.photoUrl} onUpdate={onUpdate} placeholder="https://..." />
        <InputGroup label="Logo Linki (URL)" name="logoUrl" value={data.logoUrl.startsWith('data:') ? 'Görsel işlendi (Base64)' : data.logoUrl} onUpdate={onUpdate} placeholder="https://..." />
      </section>

      <section>
        <h3 className="text-xs font-bold text-slate-500 mb-4 border-b border-slate-800 pb-2 uppercase">
          <i className="fas fa-user-circle text-[#FDCD1F]"></i> Kişisel Bilgiler
        </h3>
        <InputGroup label="Ad Soyad" name="name" value={data.name} onUpdate={onUpdate} />
        <InputGroup label="Unvan" name="title" value={data.title} onUpdate={onUpdate} />
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Kısa Bilgi</label>
          <textarea
            rows={2}
            value={data.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-[#FDCD1F] outline-none text-sm text-white resize-none"
          />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-slate-500 mb-4 border-b border-slate-800 pb-2 uppercase">
          <i className="fas fa-phone text-[#FDCD1F]"></i> İletişim
        </h3>
        <InputGroup label="Telefon" name="phone1" value={data.phone1} onUpdate={onUpdate} />
        <InputGroup label="E-posta" name="email" value={data.email} type="email" onUpdate={onUpdate} />
        <InputGroup label="Web" name="website" value={data.website} onUpdate={onUpdate} />
        <InputGroup label="Adres" name="addressLine1" value={data.addressLine1} onUpdate={onUpdate} />
      </section>

      <section>
        <h3 className="text-xs font-bold text-slate-500 mb-4 border-b border-slate-800 pb-2 uppercase">
          <i className="fas fa-share-nodes text-[#FDCD1F]"></i> Sosyal
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(data.socials).map(([key, value]) => (
            <div key={key}>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{key}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => onUpdate({ socials: { ...data.socials, [key]: e.target.value } })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white outline-none"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Controls;
