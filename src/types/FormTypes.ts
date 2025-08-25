import { z } from 'zod'
import { ThumbnailStyle } from "./ThumbnailStyle";

export const FormSchema = z.object({
  screenshot_file: z.instanceof(File).optional().nullable(),
  channel_logo_file: z.instanceof(File).optional().nullable(),
  game_logo_file: z.instanceof(File).optional().nullable(),
  season: z.string().optional().nullable(),
  episode: z.string().optional().nullable(),
  title: z.string().min(0).max(120).optional().nullable(),
  style: z.string(),
  strength: z.coerce.number().min(1).max(3).default(1),
  borderHex: z.string().regex(/^#([0-9a-fA-F]{6})$/),
  borderAlpha: z.number().min(0).max(1).default(0),
  overlayHex: z.string().regex(/^#([0-9a-fA-F]{6})$/),
  overlayAlpha: z.number().min(0).max(1).default(0),
  width: z.number().min(1).max(3840).default(1280),
  height: z.number().min(1).max(2160).default(720),
})

export type FormData = z.infer<typeof FormSchema & {
  style: ThumbnailStyle;
}>

export type GenerateResponse =
  | { ok: true; url: string; blob?: Blob; filename?: string }
  | { ok: false; error: string }
