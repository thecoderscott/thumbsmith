import { useEffect, useRef } from 'react'
import { drawPreview } from '../lib/canvas'
import { FormData } from "../types/FormTypes";

interface CanvasPreviewProps extends FormData {
  image: HTMLImageElement | ImageBitmap | undefined
}

const CanvasPreview = ({
  image,
  ...rest
}: CanvasPreviewProps) => {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const c = ref.current

    if (!c) return

    c.width = rest.width;
    c.height = rest.height;

    const ctx = c.getContext('2d')

    if (!ctx) return

    drawPreview(ctx, {
      img: image,
      ...rest,
    })
  }, [image, rest])

  return <canvas ref={ref} aria-label="thumbnail preview" />
}

export default CanvasPreview;
