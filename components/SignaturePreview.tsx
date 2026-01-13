
import React from 'react';
import { SignatureData } from '../types';

interface SignaturePreviewProps {
  data: SignatureData;
}

const SignaturePreview: React.FC<SignaturePreviewProps> = ({ data }) => {
  const bColor = data.brandColor || "#FDCD1F";
  const dGray = "#333333";
  const lGray = "#666666";
  const bgBrokenWhite = "#FAFAFA"; 
  const nameParts = data.name.trim().split(' ');
  const fName = nameParts[0] || '';
  const lName = nameParts.slice(1).join(' ');

  const getIcon = (n: string) => {
    const i: Record<string, string> = {
      yt: 'https://img.icons8.com/material-sharp/24/333333/youtube-play.png',
      ig: 'https://img.icons8.com/material-sharp/24/333333/instagram-new.png',
      in: 'https://img.icons8.com/material-sharp/24/333333/linkedin--v1.png',
      ph: 'https://img.icons8.com/material-sharp/24/ffffff/phone.png',
      em: 'https://img.icons8.com/material-sharp/24/ffffff/mail.png',
      ad: 'https://img.icons8.com/material-sharp/24/ffffff/marker.png'
    };
    return i[n];
  };

  const photoSrc = data.photoUrl || 'https://placehold.co/160x220/f4f4f4/333333.png?text=Photo';
  
  // Eğer görsel Base64 ise (kullanıcı yüklediyse), bu görsel artık
  // Sarı Çerçeve + Beyaz Boşluk + Profil Resmini tek parça halinde içerir.
  // HTML ile şekil vermeye çalışmak Outlook'u bozar.
  const isMergedImage = data.photoUrl.startsWith('data:');

  return (
    <table cellPadding="0" cellSpacing="0" style={{ width: '100%', maxWidth: '600px', fontFamily: 'Arial, Helvetica, sans-serif', borderCollapse: 'collapse', backgroundColor: bgBrokenWhite, border: 'none' }}>
      <tbody>
        <tr>
          {/* SOL ŞERİT: SOSYAL MEDYA */}
          <td width="35" style={{ verticalAlign: 'middle', backgroundColor: bColor, textAlign: 'center', border: 'none', padding: '15px 0' }}>
            {[
              { i: 'yt', l: data.socials.youtube },
              { i: 'ig', l: data.socials.instagram },
              { i: 'in', l: data.socials.linkedin }
            ].map((s, idx) => (
              <div key={idx} style={{ padding: '6px 0' }}>
                <a href={s.l && s.l !== '#' ? s.l : '#'} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <table cellPadding="0" cellSpacing="0" style={{ borderRadius: '4px', backgroundColor: '#ffffff', border: 'none', margin: '0 auto' }}>
                    <tbody>
                      <tr>
                        <td width="22" height="22" style={{ verticalAlign: 'middle', textAlign: 'center', border: 'none' }}>
                          <img src={getIcon(s.i)} width="13" height="13" style={{ display: 'block', border: 'none', margin: '0 auto' }} alt={s.i} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </a>
              </div>
            ))}
          </td>

          {/* ANA İÇERİK ALANI */}
          <td style={{ padding: '15px 15px 0 15px', verticalAlign: 'top', border: 'none', fontSize: 0, textAlign: 'left' }}>
            
            {/* BLOCK 1: FOTOĞRAF & İSİM (SOL) */}
            <table align="left" cellPadding="0" cellSpacing="0" style={{ display: 'inline-block', verticalAlign: 'top', width: '290px', margin: '0 15px 15px 0', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  {/* Dikey Çizgi (border-right) */}
                  <td style={{ paddingRight: '15px', borderRight: '1px solid #e5e5e5', borderBottom: 'none', borderTop: 'none', borderLeft: 'none' }}>
                    <table cellPadding="0" cellSpacing="0" width="100%" style={{ borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          {/* FOTOĞRAF ALANI */}
                          <td width="95" style={{ verticalAlign: 'top', padding: 0 }}>
                            {isMergedImage ? (
                              // TEK PARÇA GÖRSEL MODU (OUTLOOK UYUMLU)
                              // Arka plan rengi, çerçeve ve resim tek bir PNG içindedir.
                              // Kenarları #FAFAFA (imza zemin rengi) ile doldurulduğu için
                              // Outlook dikdörtgen gösterse bile köşeler görünmez.
                              <img 
                                src={photoSrc} 
                                width="95" 
                                height="125" 
                                style={{ display: 'block', border: 'none' }} 
                                alt="Profile" 
                              />
                            ) : (
                              // VARSAYILAN URL MODU (Eğer kullanıcı dosya yüklemediyse)
                              <table cellPadding="0" cellSpacing="0" style={{ borderTopRightRadius: '55px', borderBottomRightRadius: '55px', backgroundColor: bColor }}>
                                <tbody>
                                  <tr>
                                    <td style={{ padding: '5px 5px 5px 0' }}>
                                      <div style={{ width: '85px', height: '115px', borderTopRightRadius: '50px', borderBottomRightRadius: '50px', overflow: 'hidden', backgroundColor: '#eeeeee' }}>
                                        <img 
                                          src={photoSrc} 
                                          width="85" 
                                          height="115" 
                                          style={{ display: 'block', border: 'none', objectFit: 'cover' }} 
                                          alt="Profile" 
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            )}
                          </td>
                          {/* İSİM BİLGİLERİ */}
                          <td style={{ paddingLeft: '10px', verticalAlign: 'top' }}>
                            <div style={{ fontSize: '19px', lineHeight: '24px', fontWeight: 'bold', color: dGray, paddingTop: '5px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                              {fName} <span style={{ color: bColor }}>{lName}</span>
                            </div>
                            <div style={{ fontSize: '11px', lineHeight: '14px', color: dGray, fontWeight: 'bold', margin: '4px 0', fontFamily: 'Arial, Helvetica, sans-serif', textTransform: 'none' }}>{data.title}</div>
                            <div style={{ width: '30px', height: '3px', backgroundColor: bColor, margin: '12px 0' }}></div>
                            <div style={{ fontSize: '10px', lineHeight: '14px', color: lGray, maxWidth: '160px', fontFamily: 'Arial, Helvetica, sans-serif' }}>{data.description}</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* BLOCK 2: İLETİŞİM (SAĞ) */}
            <table align="left" cellPadding="0" cellSpacing="0" style={{ display: 'inline-block', verticalAlign: 'top', width: '220px', margin: '0 0 15px 0', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'top' }}>
                    <table cellPadding="0" cellSpacing="0" width="100%" style={{ borderCollapse: 'collapse' }}>
                      <tbody>
                        {/* LOGO */}
                        <tr>
                          <td style={{ paddingBottom: '15px' }}>
                            {data.logoUrl ? (
                              <img src={data.logoUrl} style={{ display: 'block', maxHeight: '40px', maxWidth: '150px', border: 'none' }} alt="Logo" />
                            ) : (
                              <div style={{ fontSize: '18px', fontWeight: 'bold', color: dGray, fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                <span style={{ color: bColor }}>De</span>OSGB
                              </div>
                            )}
                          </td>
                        </tr>
                        {/* İLETİŞİM */}
                        <tr>
                          <td>
                            {[
                              { i: 'ph', t: [data.phone1, data.phone2] },
                              { i: 'em', t: [data.email, data.website] },
                              { i: 'ad', t: [data.addressLine1] }
                            ].map((item, idx) => {
                              const filteredLines = item.t.filter(l => l);
                              if (filteredLines.length === 0) return null;
                              return (
                                <table key={idx} cellPadding="0" cellSpacing="0" style={{ marginBottom: '8px', borderCollapse: 'collapse' }}>
                                  <tbody>
                                    <tr>
                                      <td width="22" style={{ verticalAlign: 'top' }}>
                                        <table cellPadding="0" cellSpacing="0" style={{ borderRadius: '50%', backgroundColor: bColor }}>
                                          <tbody>
                                            <tr>
                                              <td width="18" height="18" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                                <img src={getIcon(item.i)} width="10" height="10" style={{ display: 'block', border: 'none', margin: '0 auto' }} alt={item.i} />
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                      <td style={{ fontSize: '10px', color: dGray, paddingLeft: '8px', lineHeight: '14px', verticalAlign: 'top', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                        {filteredLines.map((line, lidx) => (
                                          <div key={lidx} style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{line}</div>
                                        ))}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              );
                            })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default SignaturePreview;
