
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

  // Marka rengi değiştiğinde, eğer kullanıcı daha önce bir resim yüklediyse,
  // resmi yeni renkle tekrar işle (Böylece sarı çerçeve yeni renk olur).
  useEffect(() => {
    if (rawFile && data.brandColor) {
      processProfileImage(rawFile, data.brandColor).then((base64) => {
        // Döngüye girmemesi için sadece base64 değişirse update etmeli, 
        // ama basitlik için direkt güncelliyoruz. React state batching bunu halleder.
        // Ancak sonsuz döngüyü kırmak için mevcut url ile kıyaslayabiliriz veya güvenebiliriz.
        // Güvenli yöntem: processProfileImage her zaman yeni string üretir.
        // App.tsx'deki handleUpdate sadece veri değişirse re-render yapar.
        onUpdate({ photoUrl: base64 });
      });
    }
    // Dependency array'e onUpdate eklemiyoruz, çünkü onUpdate değişebilir ama biz sadece renk/dosya değişince çalışsın istiyoruz.
  }, [data.brandColor, rawFile]);

  // Profil fotoğrafını ve ÇERÇEVEYİ tek bir resim haline getiren fonksiyon
  const processProfileImage = (file: File, color: string): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          // HTML Tasarımındaki oranlar (2 katı çözünürlük / Retina için)
          // HTML: OuterWidth: 95, InnerImg: 85 (Padding Right 5, Top 5, Bottom 5)
          // Scale 2x:
          const scale = 2;
          const outerWidth = 95 * scale;  // 190
          const outerHeight = 125 * scale; // 250
          
          // Çerçeve Yarıçapı (HTML'de 55px -> 2x = 110px)
          const outerRadius = 55 * scale;

          canvas.width = outerWidth;
          canvas.height = outerHeight;

          // 1. DIŞ ÇERÇEVEYİ ÇİZ (Marka Rengi)
          // D Şekli: Sol taraf düz, sağ taraf kavisli
          ctx.beginPath();
          ctx.moveTo(0, 0); 
          ctx.lineTo(outerWidth - outerRadius, 0);
          ctx.quadraticCurveTo(outerWidth, 0, outerWidth, outerRadius);
          ctx.lineTo(outerWidth, outerHeight - outerRadius);
          ctx.quadraticCurveTo(outerWidth, outerHeight, outerWidth - outerRadius, outerHeight);
          ctx.lineTo(0, outerHeight);
          ctx.closePath();
          
          ctx.fillStyle = color;
          ctx.fill();

          // 2. RESİM ALANINI OLUŞTUR (Clipping Mask)
          // Padding: Top 5, Right 5, Bottom 5, Left 0 (HTML'deki yapı)
          // Scale 2x -> Top 10, Right 10, Bottom 10, Left 0
          const padTop = 5 * scale;
          const padRight = 5 * scale;
          const padBottom = 5 * scale;
          const padLeft = 0;

          const innerWidth = outerWidth - padLeft - padRight;   // 190 - 0 - 10 = 180
          const innerHeight = outerHeight - padTop - padBottom; // 250 - 10 - 10 = 230
          const innerX = padLeft;
          const innerY = padTop;
          // İç köşe yarıçapı: 50px -> 2x = 100px
          const innerRadius = 50 * scale;

          ctx.beginPath();
          ctx.moveTo(innerX, innerY);
          ctx.lineTo(innerX + innerWidth - innerRadius, innerY);
          ctx.quadraticCurveTo(innerX + innerWidth, innerY, innerX + innerWidth, innerY + innerRadius);
          ctx.lineTo(innerX + innerWidth, innerY + innerHeight - innerRadius);
          ctx.quadraticCurveTo(innerX + innerWidth, innerY + innerHeight, innerX + innerWidth - innerRadius, innerY + innerHeight);
          ctx.lineTo(innerX, innerY + innerHeight);
          ctx.closePath();
          
          // Bu alanın içini temizle veya direkt maskele
          ctx.clip();

          // 3. RESMİ ÇİZ (Object-fit: Cover mantığı)
          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = img.width;
          let sourceHeight = img.height;
          
          const imgRatio = img.width / img.height;
          const targetRatio = innerWidth / innerHeight;

          if (imgRatio > targetRatio) {
            // Resim daha geniş
            sourceWidth = img.height * targetRatio;
            sourceX = (img.width - sourceWidth) / 2;
          } else {
            // Resim daha uzun
            sourceHeight = img.width / targetRatio;
            sourceY = (img.height - sourceHeight) / 2;
          }

          // Arka planı (şeffaf png ise arkası beyaz olsun diye opsiyonel, ama şeffaf bırakıyoruz)
          // ctx.fillStyle = '#eeeeee'; 
          // ctx.fillRect(innerX, innerY, innerWidth, innerHeight);

          ctx.drawImage(
            img, 
            sourceX, sourceY, sourceWidth, sourceHeight, 
            innerX, innerY, innerWidth, innerHeight
          );
          
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'logoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (field === 'photoUrl') {
          // Orijinal dosyayı sakla (renk değişince tekrar kullanacağız)
          setRawFile(file);
          // İlk işlemeyi yap
          const processedBase64 = await processProfileImage(file, data.brandColor);
          onUpdate({ [field]: processedBase64 });
        } else {
          // Logo işlemi aynı kalır
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target?.result) {
              onUpdate({ [field]: ev.target.result as string });
            }
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error("Görsel işlenirken hata oluştu:", error);
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
                Dosya Seç (Outlook Uyumlu)
              </div>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileUpload(e, 'photoUrl')} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Logo</label>
            <div className="relative group h-20 bg-slate-800 rounded-xl border border-dashed border-slate-700 overflow-hidden flex items-center justify-center hover:border-[#FDCD1F] transition-colors p-2">
              {data.logoUrl ? <img src={data.logoUrl} className="max-w-full max-h-full object-contain" /> : <i className="fas fa-plus text-slate-600"></i>}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-bold text-center p-2 uppercase cursor-pointer">
                Dosya Seç (Orijinal)
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
