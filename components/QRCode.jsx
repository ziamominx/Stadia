'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRCodeCard({ text, value, size = 168 }) {
  const [url, setUrl] = useState(null);
  const dataToEncode = text || value || '';

  useEffect(() => {
    let alive = true;
    if (!dataToEncode) return;

    QRCode.toDataURL(dataToEncode, {
      width: size,
      margin: 1,
      color: { dark: '#0b1424', light: '#ffffff' },
    })
      .then((u) => {
        if (alive) setUrl(u);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [dataToEncode, size]);

  if (!url) {
    return (
      <div
        className="animate-pulse rounded-lg bg-slate-800"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <img
      src={url}
      alt="Digital ticket QR code"
      className="rounded-lg"
      style={{ width: size, height: size }}
    />
  );
}
