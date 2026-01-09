
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

  return (
    <table cellPadding="0" cellSpacing="0" style={{ width: '100%', maxWidth: '480px', fontFamily: 'Arial, Helvetica, sans-serif', borderCollapse: 'collapse', backgroundColor: bgBrokenWhite, border: 'none' }}>
      <tbody>
        <tr>
          <td style={{ verticalAlign: 'top', border: 'none' }}>
            <table cellPadding="0" cellSpacing="0" width="100%" style={{ borderCollapse: 'collapse', border: 'none' }}>
              <tbody>
                <tr>
                  {/* SOSYAL MEDYA ŞERİDİ */}
                  <td width="30" style={{ padding: '10px 0', verticalAlign: 'middle', backgroundColor: bColor, textAlign: 'center' }}>
                    {[
                      { i: 'yt', l: data.socials.youtube },
                      { i: 'ig', l: data.socials.instagram },
                      { i: 'in', l: data.socials.linkedin }
                    ].map((s, idx) => (
                      <div key={idx} style={{ padding: '4px 0' }}>
                        <a href={s.l && s.l !== '#' ? s.l : '#'} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                          <table cellPadding="0" cellSpacing="0" style={{ borderRadius: '4px', backgroundColor: '#ffffff', border: 'none', margin: '0 auto' }}>
                            <tbody>
                              <tr>
                                <td width="18" height="18" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                  <img src={getIcon(s.i)} width="12" height="12" style={{ display: 'block', border: 'none', margin: '0 auto' }} alt={s.i} />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </a>
                      </div>
                    ))}
                  </td>

                  {/* İÇERİK ALANI */}
                  <td style={{ padding: '10px', verticalAlign: 'top' }}>
                    
                    {/* ÜST BLOK: FOTOĞRAF + İSİM */}
                    <table cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse', marginBottom: '10px', border: 'none', float: 'left' }}>
                      <tbody>
                        <tr>
                          <td width="105" style={{ verticalAlign: 'middle', border: 'none' }}>
                            <table cellPadding="0" cellSpacing="0" style={{ borderTopRightRadius: '50px', borderBottomRightRadius: '50px', backgroundColor: bColor, border: 'none' }}>
                              <tbody>
                                <tr>
                                  <td style={{ padding: '4px 4px 4px 0', border: 'none' }}>
                                    <div style={{ width: '80px', height: '110px', borderTopRightRadius: '45px', borderBottomRightRadius: '45px', overflow: 'hidden', backgroundColor: '#eeeeee' }}>
                                      <img src={photoSrc} width="80" height="110" style={{ display: 'block', border: 'none' }} alt="Profile" />
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                          <td style={{ padding: '0 10px', verticalAlign: 'middle', border: 'none' }}>
                            <div style={{ fontSize: '15px', fontWeight: 'bold', color: dGray, lineHeight: '18px' }}>
                              {fName} <span style={{ color: bColor }}>{lName}</span>
                            </div>
                            <div style={{ fontSize: '10px', color: dGray, fontWeight: 'bold', margin: '2px 0' }}>{data.title}</div>
                            <div style={{ width: '20px', height: '2px', backgroundColor: bColor, margin: '5px 0' }}></div>
                            <div style={{ fontSize: '9px', lineHeight: '11px', color: lGray, maxWidth: '130px' }}>{data.description}</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* DİKEY AYRAÇ */}
                    <table cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse', border: 'none', float: 'left' }}>
                      <tbody>
                        <tr>
                          <td width="1" style={{ padding: '0', backgroundColor: bColor, border: 'none' }}>
                            <div style={{ width: '1px', height: '80px', fontSize: '1px' }}>&nbsp;</div>
                          </td>
                          <td width="15" style={{ fontSize: '1px', border: 'none' }}>&nbsp;</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* ALT BLOK: LOGO + İLETİŞİM */}
                    <table cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse', border: 'none', float: 'left' }}>
                      <tbody>
                        <tr>
                          <td style={{ verticalAlign: 'middle', border: 'none' }}>
                            <div style={{ paddingBottom: '10px' }}>
                              {data.logoUrl ? (
                                <img src={data.logoUrl} style={{ display: 'block', maxHeight: '30px', maxWidth: '130px', border: 'none' }} alt="Logo" />
                              ) : (
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: dGray }}>
                                  <span style={{ color: bColor }}>De</span>OSGB
                                </div>
                              )}
                            </div>

                            {[
                              { i: 'ph', t: [data.phone1, data.phone2] },
                              { i: 'em', t: [data.email, data.website] },
                              { i: 'ad', t: [data.addressLine1] }
                            ].map((item, idx) => (
                              <table key={idx} cellPadding="0" cellSpacing="0" style={{ marginBottom: '4px', borderCollapse: 'collapse', border: 'none' }}>
                                <tbody>
                                  <tr>
                                    <td width="18" style={{ verticalAlign: 'top', border: 'none' }}>
                                      <table cellPadding="0" cellSpacing="0" style={{ borderRadius: '50%', backgroundColor: bColor, border: 'none' }}>
                                        <tbody>
                                          <tr>
                                            <td width="16" height="16" style={{ verticalAlign: 'middle', textAlign: 'center', border: 'none' }}>
                                              <img src={getIcon(item.i)} width="10" height="10" style={{ display: 'block', border: 'none', margin: '0 auto' }} alt={item.i} />
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                    <td style={{ fontSize: '9px', color: dGray, paddingLeft: '8px', lineHeight: '11px', border: 'none' }}>
                                      {item.t.filter(l => l).map((line, lidx) => (
                                        <div key={lidx}>{line}</div>
                                      ))}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            ))}
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
