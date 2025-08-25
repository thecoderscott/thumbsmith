import { useCallback, useEffect, useState } from 'react'
import { generateThumb } from '../lib/api'

import { FormData, FormSchema } from '../types/FormTypes'

import { useThumbnail } from "../hooks/useThumbnail";

import CanvasPreview from './CanvasPreview'
import {ThumbnailOptions} from "../types/ThumbnailStyle";

const ThumbnailForm = () => {
  const { formData, onHandleFieldUpdate, onHandleReset } = useThumbnail();

  const [img, setImg] = useState<HTMLImageElement | ImageBitmap>();
  const [isGen, setIsGen] = useState(false)
  const [outUrl, setOutUrl] = useState<string | null>(null)
  const [outBlob, setOutBlob] = useState<Blob | null>(null)
  const [outName, setOutName] = useState('thumbnail.png')

  // Load image preview
  useEffect(() => {
    if (!formData.screenshot_file) { setImg(undefined); return }

    const url = URL.createObjectURL(formData.screenshot_file)
    const im = new Image()

    im.onload = async () => {
      try {
        if ('createImageBitmap' in window) {
          const bmp = await createImageBitmap(im)
          setImg(bmp)
        } else {
          setImg(im)
        }
      } finally {
        URL.revokeObjectURL(url)
      }
    }

    im.src = url

    return () => {
      if (outUrl?.startsWith('blob:')) URL.revokeObjectURL(outUrl)
    }
  }, [formData.screenshot_file])

  const onGenerate = async () => {
    const parsed = FormSchema.safeParse(formData);

    if (!parsed.success) {
      alert(parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n'));
      return;
    }

    setIsGen(true)

    try {
      const res = await generateThumb(parsed.data)
      if (res.ok) {
        if (outUrl?.startsWith('blob:')) URL.revokeObjectURL(outUrl)
        setOutUrl(res.url)
        setOutBlob(res.blob ?? null)
        setOutName(res.filename ?? 'thumbnail.png')
      } else {
        alert(`Generate failed: ${res.error}`)
      }
    } finally {
      setIsGen(false)
    }
  }

  const downloadOut = async () => {
    if (!outUrl) return

    if (outBlob) {
      const a = document.createElement('a')
      a.href = outUrl; a.download = outName
      document.body.appendChild(a); a.click(); a.remove()
      return
    }

    // If the server returned a remote URL via JSON, fetch -> blob for reliable download.
    try {
      const r = await fetch(outUrl);

      if (r.ok) {
        const b = await r.blob();
        const u = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = u;
        a.download = outName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(u), 5000);
      } else {
        window.open(outUrl, '_blank'); // fallback
      }
    } catch {
      window.open(outUrl, '_blank');
    }
  }

  const clearOut = () => {
    if (outUrl?.startsWith('blob:')) URL.revokeObjectURL(outUrl)
    setOutUrl(null); setOutBlob(null); setOutName('thumbnail.png')
  }

  const onHandleResetClick = useCallback(() => {
    onHandleReset();
    setIsGen(false);
    setOutUrl(null);
    setOutBlob(null);
    setOutName("thumbnail.png");
  }, []);

  const onHandleClearFileField = useCallback(
    (fieldName: keyof FormData) => {
      onHandleFieldUpdate(fieldName, null);
      const el = document.getElementById(fieldName) as HTMLInputElement | null;

      if (!el) return;

      el.value = '';
      el.dispatchEvent(new Event("change", { bubbles: true }));
    },
  []);

  return (
    <div className="grid">
      <div className="card">
        <div className="header">
          <div className="title">Controls</div>
        </div>

        <div className="row">
          <div className="file-upload-label">
            <label htmlFor="screenshot_file">
              Background image
            </label>
            <button className="ghost" type="button" onClick={() => onHandleClearFileField("screenshot_file")}>Clear</button>
          </div>
          <input id="screenshot_file" type="file" accept="image/*" onChange={e => onHandleFieldUpdate("screenshot_file", e.target.files?.[0] ?? null)} />
          <div className="help">Use a high‑res still from your gameplay.</div>
        </div>

        <div className="row">
          <div className="file-upload-label">
            <label htmlFor="channel_logo_file">
              Channel Logo
            </label>
            <button className="ghost" type="button" onClick={() => onHandleClearFileField("channel_logo_file")}>Clear</button>
          </div>
          <input id="channel_logo_file" type="file" accept="image/*" onChange={e => onHandleFieldUpdate("channel_logo_file", e.target.files?.[0] ?? null)} />
          <div className="help">Places the channel logo in the bottom left corner.</div>
        </div>

        <div className="row">
          <div className="file-upload-label">
            <label htmlFor="game_logo_file">
              Game Logo
            </label>
            <button className="ghost" type="button" onClick={() => onHandleClearFileField("game_logo_file")}>Clear</button>
          </div>
          <input id="game_logo_file" type="file" accept="image/*" onChange={e => onHandleFieldUpdate("game_logo_file", e.target.files?.[0] ?? null)} />
          <div className="help">Places the channel logo in the bottom left corner.</div>
        </div>

        <div className="row">
          <label htmlFor="title">Title</label>
          <input id="title" type="text" value={formData.title || undefined} onChange={e => onHandleFieldUpdate("title", e.target.value)} />
          <div className="help">Only used if game logo not provided.</div>
        </div>

        <div className="row">
          <label htmlFor="season">Season</label>
          <input id="season" type="number" value={formData.season || undefined} onChange={e => onHandleFieldUpdate("season", parseInt(e.target.value))} />
          <div className="help">Only used if game logo not provided.</div>
        </div>

        <div className="row">
          <label htmlFor="episode">Episode</label>
          <input id="episode" type="number" value={formData.episode || undefined} onChange={e => onHandleFieldUpdate("episode", parseInt(e.target.value))} />
          <div className="help">Only used if game logo not provided.</div>
        </div>

        <div className="row">
          <label htmlFor="style">Style</label>
          <select id="style" value={formData.style} onChange={e => onHandleFieldUpdate("style", e.target.value)}>
            <option value={`${ThumbnailOptions.game}`}>Game</option>
            <option value={`${ThumbnailOptions.photo}`}>Photo</option>
            <option value={`${ThumbnailOptions.avatar}`}>Avatar</option>
          </select>
        </div>

        <div className="row">
          <label htmlFor="strength">Strength</label>
          <select id="strength" value={formData.strength} onChange={e => onHandleFieldUpdate("strength", parseInt(e.target.value, 10))}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>

        <div className="row">
          <label>Border</label>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
            <input type="color" value={formData.borderHex} onChange={e => onHandleFieldUpdate("borderHex", e.target.value)} />
            <input type="range" min={0} max={1} step={0.05} value={formData.borderAlpha}
                   onChange={e => onHandleFieldUpdate("borderAlpha", Number(e.target.value))} />
          </div>
          <div className="help">Tint + alpha to unify your grid.</div>
        </div>

        <div className="row">
          <label>Overlay</label>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
            <input type="color" value={formData.overlayHex} onChange={e => onHandleFieldUpdate("overlayHex", e.target.value)} />
            <input type="range" min={0} max={1} step={0.05} value={formData.overlayAlpha}
              onChange={e => onHandleFieldUpdate("overlayAlpha", Number(e.target.value))} />
          </div>
          <div className="help">Tint + alpha to unify your grid.</div>
        </div>

        <div className="row">
          <label htmlFor="width">Width</label>
          <input id="width" type="number" value={formData.width || undefined} onChange={e => onHandleFieldUpdate("width", e.target.value)} />
        </div>

        <div className="row">
          <label htmlFor="height">Height</label>
          <input id="height" type="number" value={formData.height || undefined} onChange={e => onHandleFieldUpdate("height", e.target.value)} />
        </div>

        <div className="actions">
          <button className="ghost" type="button" onClick={onHandleResetClick}>Reset</button>
          <button type="button" onClick={onGenerate}>
            {isGen ? 'Generating…' : 'Generate with API'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="header">
          <div className="title">Preview</div>
          <div className="small">1280×720 canvas (YouTube friendly)</div>
        </div>

        <CanvasPreview
          image={img ?? undefined}
          {...formData}
        />

        {outUrl && (
          <div className="card">
            <div className="header">
              <div className="title">Output</div>
              <div className="small">{outName}</div>
            </div>

            <img src={outUrl} alt="Generated thumbnail" style={{ width: '100%', borderRadius: 12, display: 'block' }} />

            <div className="actions" style={{ marginTop: 8 }}>
              <button onClick={downloadOut}>Download</button>
              <button className="ghost" onClick={clearOut}>Clear</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ThumbnailForm;
