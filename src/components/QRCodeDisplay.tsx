/**
 * @fileoverview QR Code display component
 * 
 * Generates and displays a QR code linking to the patient document
 */

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  /** URL to encode in the QR code */
  url: string;
  /** Size of the QR code in pixels */
  size?: number;
  /** Optional label text below QR code */
  label?: string;
  /** Error correction level */
  level?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Renders a QR code with optional label
 */
export const QRCodeDisplay = ({ 
  url, 
  size = 128, 
  label,
  level = 'M' 
}: QRCodeDisplayProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-3 bg-white rounded-lg shadow-sm">
        <QRCodeSVG 
          value={url} 
          size={size}
          level={level}
          includeMargin={false}
        />
      </div>
      {label && (
        <p className="text-sm text-muted-foreground text-center max-w-[200px]">
          {label}
        </p>
      )}
    </div>
  );
};
