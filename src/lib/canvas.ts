import {FormData} from "../types/FormTypes";

export interface DrawOpts extends FormData {
  img?: HTMLImageElement | ImageBitmap
}

function hexToRGB(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [0,0,0] as const;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] as const;
}

export function drawPreview(ctx: CanvasRenderingContext2D, opts: DrawOpts) {
  const { width, height } = opts;
  ctx.clearRect(0, 0, width, height);

  // Background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  // Image
  if (opts.img) {
    const iw = (opts.img as any).width;
    const ih = (opts.img as any).height;
    const targetW = width;
    const targetH = (ih / iw) * targetW;
    const x = (width - targetW) / 2;
    const y = (height - targetH) / 2;

    ctx.drawImage(opts.img as any, x, y, targetW, targetH);
    (ctx as any).filter = 'none';
  }

  // Overlay tint
  if (opts.overlayHex && (opts.overlayAlpha ?? 0) > 0) {
    const [r,g,b] = hexToRGB(opts.overlayHex);
    ctx.fillStyle = `rgba(${r},${g},${b},${opts.overlayAlpha})`;
    ctx.fillRect(0, 0, width, height);
  }

  // Text
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Title
  if (opts.title) {
    ctx.font = `bold ${Math.round(height * 0.12)}px Inter, system-ui, sans-serif`;
    const pad = Math.round(width * 0.05);
    const maxTitleWidth = width - pad * 2;
    wrapText(ctx, opts.title, pad, height - pad * 2, maxTitleWidth, Math.round(height * 0.13));
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let dy = 0;

  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    const m = ctx.measureText(test);

    if (m.width > maxWidth && line) {
      ctx.fillText(line, x, y + dy);
      line = w;
      dy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y + dy);
}
