/**
 * @fileoverview Print document footer component
 * 
 * Displays clinician signature and QR code for document access
 */

import { QRCodeSVG } from 'qrcode.react';

interface PrintFooterProps {
  /** Approving clinician name */
  clinicianName: string;
  /** Document approval date */
  date: string;
  /** Optional public document URL for QR code */
  documentUrl?: string;
  /** Language for localized labels */
  language: string;
}

const LABELS: Record<string, { signedBy: string; scanQr: string }> = {
  estonian: {
    signedBy: "Kinnitanud",
    scanQr: "Skanni digitaalseks koopiaks"
  },
  russian: {
    signedBy: "Утверждено",
    scanQr: "Сканируйте для цифровой копии"
  },
  english: {
    signedBy: "Signed by",
    scanQr: "Scan for digital copy"
  }
};

/**
 * Renders the document footer with signature and QR code
 */
export const PrintFooter = ({ 
  clinicianName, 
  date, 
  documentUrl,
  language 
}: PrintFooterProps) => {
  const normalizedLang = language?.toLowerCase() || 'english';
  const labels = LABELS[normalizedLang] || LABELS.english;
  
  return (
    <div className="print-footer">
      <div className="print-signature">
        <p className="print-signature-label">{labels.signedBy}</p>
        <p className="print-signature-line font-medium">{clinicianName}</p>
        <p className="text-[9pt] text-[hsl(var(--print-text-light))] mt-1">{date}</p>
      </div>
      
      {documentUrl && (
        <div className="print-qr-container">
          <QRCodeSVG 
            value={documentUrl} 
            size={64}
            level="M"
            includeMargin={false}
          />
          <p className="print-qr-label">{labels.scanQr}</p>
        </div>
      )}
    </div>
  );
};
