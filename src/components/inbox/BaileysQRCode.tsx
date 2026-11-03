"use client";

import { QRCodeSVG } from "qrcode.react";

export type BaileysQRCodeProps = {
  qr?: string | null;
};

export default function BaileysQRCode({ qr }: BaileysQRCodeProps) {
  if (!qr) {
    return (
      <div className="grid h-52 w-52 place-items-center rounded-xl border border-[var(--border)] bg-white text-xs text-gray-500">
        Waiting for QR code…
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <QRCodeSVG value={qr} size={208} level="H" includeMargin />
    </div>
  );
}
