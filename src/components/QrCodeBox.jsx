import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function QrCodeBox({ value, size = 112 }) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    let active = true;
    if (!value) return undefined;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: {
        dark: '#090b10',
        light: '#f3efe6',
      },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return <div className="qr-placeholder" style={{ width: size, height: size }} />;
  }

  return (
    <div className="qr-frame" title="สแกนเพื่อเข้าห้องนี้ทันที">
      <img src={dataUrl} alt="QR Code สำหรับเข้าร่วมห้อง" width={size} height={size} />
    </div>
  );
}
