
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

  // Renk değiştiğinde, elimizde ham dosya varsa resmi yeni renkle tekrar oluştur (Re-Baking)
  useEffect(() => {
    if (rawFile && data.brandColor) {
      processAndBakeImage(rawFile, data.brandColor).then((base64) => {
        onUpdate({ photoUrl: base64 });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.brandColor]);

  // BU FONKSİYON: Çerçeve + Beyaz Boşluk + Resim hepsini tek PNG yapar.
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
          const scale = 3; // Yüksek çözünürlük (Retina) için 3 kat büyük çalışma
          const totalWidth = 95 * scale;  // İmzada görünecek genişlik: 95px
          const totalHeight = 125 * scale; // İmzada görünecek yükseklik: 125px
          
          // Dış Çerçeve Yarıçapı (Sağ köşeler)
          const outerRadius = 55 * scale;
          
          // Resim ile Çerçeve arasındaki beyaz boşluk (Padding)
          const gap = 5 * scale; 

          canvas.width = totalWidth;
          canvas.height = totalHeight;
          ctx.clearRect(0, 0, totalWidth, totalHeight);

          // 1. ADIM: DIŞ ÇERÇEVEYİ ÇİZ (Renkli Zemin)
          drawDShape(ctx, 0, 0, totalWidth, totalHeight, outerRadius);
          ctx.fillStyle = color;
          ctx.fill();

          // 2. ADIM: ORTADAKİ BEYAZ BOŞLUĞU ÇİZ (Gap)
          // İçeriye doğru "gap" kadar küçültülmüş bir D şekli
          const innerBgX = 0; // Sol taraf düz olduğu için X değişmez (veya gap kadar içeride mi? Tasarımda sol taraf flush görünüyor, ama resim ortalı olsun dersen gap ekle. Tasarımda sol da çerçeve var gibi.)
          // Tasarıma bakınca: Resim çerçevenin içinde yüzüyor. Her yerden gap var.
          const innerBgWidth = totalWidth - gap; // Sağdan gap
          const innerBgHeight = totalHeight - (gap * 2); // Üstten ve alttan gap
          
          // Sol tarafın hizası: Eğer sol tarafta da sarı şerit varsa gap ekle.
          // Görselde sol taraf düz ve sarı çerçeve var. O yüzden soldan da gap bırakalım.
          // Düzeltme: Görselde sol tarafı sarı değil, resim sola yaslı gibi ama çerçeve D şeklinde.
          // Güvenli yöntem: Her yerden 5px (scaled) içeride beyaz alan açmak.
          
          /* Beyaz zemin çizimi (Resmin arkası) */
          drawDShape(
            ctx, 
            gap, // x
            gap, // y
            totalWidth - gap - gap, // w (Soldan ve sağdan gap) (veya sağ taraf oval)
            totalHeight - gap - gap, // h
            outerRadius - gap // radius da küçülmeli
          );
          ctx.fillStyle = '#FFFFFF'; // E-posta arka planı beyaz varsayıyoruz, boşluk rengi.
          ctx.fill();

          // 3. ADIM: RESMİ MASKELE VE ÇİZ
          // Önce maskeleme alanını (clip) oluştur
          ctx.save();
          drawDShape(
            ctx, 
            gap, 
            gap, 
            totalWidth - gap - gap, 
            totalHeight - gap - gap, 
            outerRadius - gap
          );
          ctx.clip(); // Buradan sonrası sadece bu alanın içine çizilir

          // Resmi "cover" mantığıyla yerleştir
          const drawW = totalWidth - gap - gap;
          const drawH = totalHeight - gap - gap;
          
          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = img.width;
          let sourceHeight = img.height;
          
          const imgRatio = img.width / img.height;
          const targetRatio = drawW / drawH;

          if (imgRatio > targetRatio) {
            // Resim daha geniş
            sourceWidth = img.height * targetRatio;
            sourceX = (img.width - sourceWidth) / 2;
          } else {
            // Resim daha uzun
            sourceHeight = img.width / targetRatio;
            sourceY = (img.height - sourceHeight) / 2;
          }

          ctx.drawImage(
            img, 
            sourceX, sourceY, sourceWidth, sourceHeight, 
            gap, gap, drawW, drawH
          );
          
          ctx.restore();

          // Sonuç
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Yardımcı Fonksiyon: D Şekli Çizici
  const drawDShape = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y); // Sol Üst
    ctx.lineTo(x + w - r, y); // Üst Kenar
    ctx.quadraticCurveTo(x + w, y, x + w, y + r); // Sağ Üst Köşe
    ctx.lineTo(x + w, y + h - r); // Sağ Kenar
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); // Sağ Alt Köşe
    ctx.lineTo(x, y + h); // Alt Kenar
    ctx.lineTo(x, y); // Sol Kenar (Kapat)
    ctx.closePath();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'logoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (field === 'photoUrl') {
          setRawFile(file); // Ham dosyayı sakla (renk değişimi için)
          const processedBase64 = await processAndBakeImage(file, data.brandColor);
          onUpdate({ [field]: processedBase64 });
        } else {
          // Logo için standart okuma
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target?.result) {
              onUpdate({ [field]: ev.target.result as string });
            }
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error("Hata:", error);
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
              <img src={data.photoUrl || 'https://placehold.co/100x100/333/666?text=?'} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-bold text-center p-2 uppercase cursor-pointer">
                Dosya Seç (Tek Parça PNG)
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

        <InputGroup label="Fotoğraf Linki (URL)" name="photoUrl" value={data.photoUrl.startsWith('data:') ? '' : data.photoUrl} onUpdate={onUpdate} placeholder="https://..." />
        <InputGroup label="Logo Linki (URL)" name="logoUrl" value={data.logoUrl.startsWith('data:') ? '' : data.logoUrl} onUpdate={onUpdate} placeholder="https://..." />
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
