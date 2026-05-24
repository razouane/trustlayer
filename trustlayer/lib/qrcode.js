import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

export async function generateOrderQR(orderId) {
  const token = jwt.sign(
    { orderId, type: 'delivery', exp: Math.floor(Date.now()/1000) + 48*3600 },
    process.env.JWT_SECRET
  );
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/rider/${orderId}?t=${token}`;
  const qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
  return { qrDataUrl, token, url };
}

export function verifyQRToken(token) {
  try { return jwt.verify(token, process.env.JWT_SECRET); }
  catch { return null; }
}

export function generateSecretCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateOrderId() {
  const d = new Date();
  return `TL-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${Math.floor(1000+Math.random()*9000)}`;
}

export function generateLinkToken() {
  return Math.random().toString(36).substr(2,12).toUpperCase();
}
