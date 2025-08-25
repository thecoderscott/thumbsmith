import { FormData } from "../types/FormTypes";
import { ThumbnailOptions } from "../types/ThumbnailStyle";

export const initialFormState: Required<FormData> = {
  screenshot_file: null,
  channel_logo_file: null,
  game_logo_file: null,
  season: 1,
  episode: 1,
  title: null,
  style: ThumbnailOptions.game,
  strength: 1,
  borderHex: "#8e0052",
  borderAlpha: 1,
  overlayHex: "#8e0052",
  overlayAlpha: 0.15,
  width: 1280,
  height: 720
}
