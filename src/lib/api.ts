import type { FormData, GenerateResponse } from '../types/FormTypes'

const BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? ''

const filenameFromCD = (h?: string | null) => {
  if (!h) return undefined
  const m = /filename\*?=([^;]+)/i.exec(h)

  if (!m) return undefined
  return decodeURIComponent(m[1].replace(/^UTF-8''/, '').replace(/(^"|"$)/g, ''))
}

export async function generateThumb(data: FormData): Promise<GenerateResponse> {
  const fd = new globalThis.FormData()

  fd.set('style', data.style);
  fd.set('strength', data.strength.toString());
  fd.set('edge_color', data.borderHex);
  fd.set('edge_alpha', data.borderAlpha.toString());
  fd.set('width', data.width.toString());
  fd.set('height', data.height.toString());
  if (data.screenshot_file) fd.set('screenshot', data.screenshot_file);
  if (data.channel_logo_file) fd.set('logo', data.channel_logo_file);
  if (data.game_logo_file) fd.set('game_logo', data.game_logo_file);
  if (data.season) fd.set('season_raw', data.season.toString());
  if (data.episode) fd.set('episode_raw', data.episode.toString());
  if (data.title && data.title !== "") fd.set('title', data.title);
  if (data.overlayHex) fd.set('overlay_color', data.overlayHex);
  if (data.overlayHex) fd.set('overlay_alpha', data.overlayAlpha.toString() ?? 0);

  try {
    const res = await fetch(`${BASE}/v1/generate`, {
      method: 'POST',
      body: fd,
      headers: { Accept: 'application/json, image/*' }
    })

    if (res.type === 'opaqueredirect' || res.status === 0) {
      return { ok: false, error: 'Opaque response (CORS/redirect). Enable CORS or proxy in dev.' }
    }

    const ct = res.headers.get('content-type') || ''
    if (ct.startsWith('image/')) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const filename = filenameFromCD(res.headers.get('content-disposition')) || 'thumbnail.png'
      return { ok: true, url, blob, filename }
    }

    if (ct.includes('json')) {
      const json = await res.json() as { url?: string; error?: string }
      if (json.url) return { ok: true, url: json.url }
      return { ok: false, error: json.error ?? `HTTP ${res.status}` }
    }

    return { ok: false, error: `Unexpected content-type: ${ct || 'unknown'} (HTTP ${res.status})` }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Network error' }
  }
}
