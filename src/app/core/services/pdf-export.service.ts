import { Injectable } from '@angular/core';

export interface PdfFooterOptions {
  /** Default: true */
  showPageNumbers?: boolean;
  /** Texto izquierdo en el pie (opcional) */
  leftText?: string;
}

export interface PdfExportEachPageOptions {
  fileName: string;

  /** 'p' = portrait, 'l' = landscape. Default: 'p' */
  orientation?: 'p' | 'l';
  /** Default: 'a4' */
  format?: 'a4';
  /** Márgenes en mm. Default: 10 */
  marginMm?: number;

  /**
   * Escala de render de html2canvas.
   * - 2.0 suele ser buen balance para 12 páginas
   * - 2.5–3.0 para 1 página (más nitidez)
   * Default: 2.0
   */
  scale?: number;

  /** Fondo forzado para evitar transparencias. Default: '#ffffff' */
  backgroundColor?: string;

  /** Default: 'jpeg' (más liviano y rápido para calendarios) */
  imageType?: 'jpeg' | 'png';
  /** Solo aplica para jpeg. Default: 0.9 */
  jpegQuality?: number;

  /** Default: true */
  waitForFonts?: boolean;
  /** Default: true */
  waitForImages?: boolean;

  footer?: PdfFooterOptions;

  /** Hook: antes de iniciar el proceso (una sola vez) */
  onBeforeCapture?: () => void | Promise<void>;
  /** Hook: después de guardar el PDF (una sola vez) */
  onAfterCapture?: () => void | Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  async exportElementsAsPdfPages(elements: HTMLElement[], options: PdfExportEachPageOptions): Promise<void> {
    const orientation = options.orientation ?? 'p';
    const format = options.format ?? 'a4';
    const margin = options.marginMm ?? 10;
    const scale = options.scale ?? 2;

    const backgroundColor = options.backgroundColor ?? '#ffffff';

    const imageType = options.imageType ?? 'jpeg';
    const jpegQuality = options.jpegQuality ?? 0.9;

    const waitForFonts = options.waitForFonts ?? true;
    const waitForImages = options.waitForImages ?? true;

    const footer: PdfFooterOptions = {
      showPageNumbers: options.footer?.showPageNumbers ?? true,
      leftText: options.footer?.leftText,
    };

    if (options.onBeforeCapture) await options.onBeforeCapture();

    const [{ default: html2canvas }, jspdfModule] = await Promise.all([import('html2canvas'), import('jspdf')]);
    const { jsPDF } = jspdfModule as any;

    if (waitForFonts) {
      await this.waitForFonts();
    }

    const pdf = new jsPDF(orientation, 'mm', format);
    const pageWidthMm = pdf.internal.pageSize.getWidth();
    const pageHeightMm = pdf.internal.pageSize.getHeight();
    const contentWidthMm = pageWidthMm - margin * 2;
    const contentHeightMm = pageHeightMm - margin * 2;

    const totalPages = elements.length;

    for (let i = 0; i < totalPages; i++) {
      const el = elements[i];
      if (!el) continue;

      if (i > 0) pdf.addPage();

      if (waitForImages) {
        await this.waitForImages(el);
      }

      // Capturamos solo el área real del elemento (evita canvas gigantes por viewport)
      const w = Math.max(el.scrollWidth, el.clientWidth);
      const h = Math.max(el.scrollHeight, el.clientHeight);

      const canvas = await html2canvas(el, {
        scale,
        useCORS: true,
        backgroundColor,
        scrollX: 0,
        scrollY: 0,
        windowWidth: w,
        windowHeight: h,
        width: w,
        height: h,
        removeContainer: true,
        logging: false,
      });

      const imgData =
        imageType === 'png' ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', jpegQuality);

      const imgProps = pdf.getImageProperties(imgData);

      // Ajuste proporcional para que “entre completo”
      let drawW = contentWidthMm;
      let drawH = (imgProps.height * drawW) / imgProps.width;

      // Si por alguna razón queda más alto, lo ajustamos por altura (sin cortar)
      if (drawH > contentHeightMm) {
        drawH = contentHeightMm;
        drawW = (imgProps.width * drawH) / imgProps.height;
      }

      const x = margin + (contentWidthMm - drawW) / 2;
      const y = margin + (contentHeightMm - drawH) / 2;

      pdf.addImage(imgData, imageType === 'png' ? 'PNG' : 'JPEG', x, y, drawW, drawH, undefined, 'FAST');

      this.drawFooter(pdf, footer, margin, pageWidthMm, pageHeightMm, i, totalPages);
    }

    pdf.save(options.fileName);

    if (options.onAfterCapture) await options.onAfterCapture();
  }

  private async waitForFonts(): Promise<void> {
    const anyDoc = document as any;
    if (anyDoc?.fonts?.ready) {
      try {
        await anyDoc.fonts.ready;
      } catch {
        // no-op
      }
    }
  }

  private async waitForImages(root: HTMLElement): Promise<void> {
    const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
    if (!imgs.length) return;

    await Promise.all(
      imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );
  }

  private drawFooter(
    pdf: any,
    footer: PdfFooterOptions,
    margin: number,
    pageWidthMm: number,
    pageHeightMm: number,
    pageIndex: number,
    totalPages: number
  ): void {
    if (!footer?.showPageNumbers && !footer?.leftText) return;

    pdf.setFontSize(9);
    pdf.setTextColor(90);

    const yy = pageHeightMm - margin + 4;

    if (footer.leftText) {
      pdf.text(footer.leftText, margin, yy);
    }

    if (footer.showPageNumbers) {
      const t = `Página ${pageIndex + 1} de ${totalPages}`;
      const w = pdf.getTextWidth(t);
      pdf.text(t, pageWidthMm - margin - w, yy);
    }
  }
}
