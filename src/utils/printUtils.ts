/**
 * Universal Printing Utility for Garage POS
 * Ensures 100% reliable printing across iframes, desktop, tablets, and mobile devices.
 */

export interface PrintDocumentOptions {
  title?: string;
  elementId?: string;
  htmlContent?: string;
  pageSize?: 'A4' | 'A5' | 'Letter' | '80mm' | 'auto';
  scale?: number;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

export const printDocument = (options: PrintDocumentOptions): boolean => {
  const {
    title = 'Garage Document',
    elementId,
    htmlContent,
    pageSize = 'A4',
    scale = 1.0,
    onBeforePrint,
    onAfterPrint
  } = options;

  if (onBeforePrint) {
    try {
      onBeforePrint();
    } catch (e) {
      console.error('onBeforePrint error:', e);
    }
  }

  // Determine HTML content
  let printableHTML = htmlContent;
  if (!printableHTML && elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      // Clone element to sanitize buttons if needed
      const clone = el.cloneNode(true) as HTMLElement;
      const noPrintElements = clone.querySelectorAll('.no-print');
      noPrintElements.forEach(n => n.remove());
      printableHTML = clone.innerHTML;
    }
  }

  // If isolated iframe print is supported, execute it
  try {
    let iframe = document.getElementById('garage_pos_print_frame') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'garage_pos_print_frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);
    }

    const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (frameDoc && printableHTML) {
      let hostStyles = '';
      try {
        document.querySelectorAll('style, link[rel="stylesheet"]').forEach(styleEl => {
          hostStyles += styleEl.outerHTML + '\n';
        });
      } catch (styleErr) {
        console.warn('Could not collect host styles:', styleErr);
      }

      const pageTarget = pageSize === '80mm' ? '80mm auto' : pageSize === 'A5' ? 'A5 portrait' : pageSize === 'Letter' ? 'letter portrait' : 'A4 portrait';
      const pageMargin = pageSize === '80mm' ? '2mm' : pageSize === 'A5' ? '5mm' : '8mm';

      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            ${hostStyles}
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
              
              *, *::before, *::after {
                box-sizing: border-box;
              }
              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background-color: #ffffff !important;
                color: #202321 !important;
                padding: ${pageSize === '80mm' ? '4mm' : '16px'};
                max-width: ${pageSize === '80mm' ? '80mm' : '100%'};
                margin: 0 auto;
                font-size: ${pageSize === '80mm' ? '10px' : '12px'};
                line-height: 1.4;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                zoom: ${scale};
              }
              .font-mono {
                font-family: 'JetBrains Mono', monospace !important;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              .no-print { display: none !important; }
              @page {
                size: ${pageTarget};
                margin: ${pageMargin};
              }
              @media print {
                body {
                  padding: ${pageMargin} !important;
                  zoom: ${scale} !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="${pageSize === '80mm' ? 'w-[76mm] text-[10px]' : 'w-full'}">
              ${printableHTML}
            </div>
          </body>
        </html>
      `);
      frameDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          if (onAfterPrint) onAfterPrint();
        } catch (printErr) {
          console.warn('Iframe print failed, falling back to direct window.print:', printErr);
          window.print();
          if (onAfterPrint) onAfterPrint();
        }
      }, 200);

      return true;
    }
  } catch (iframeErr) {
    console.warn('Isolated iframe setup failed, using native window.print:', iframeErr);
  }

  // Direct print fallback
  try {
    window.print();
    if (onAfterPrint) onAfterPrint();
    return true;
  } catch (err) {
    console.error('Fatal print error:', err);
    return false;
  }
};
