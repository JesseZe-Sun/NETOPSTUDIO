export interface CameraParameters {
  fov: number;
  focalLengthMm: number;
  distance: number;
  pitch: number;
  yaw: number;
  roll: number;
  position: [number, number, number];
  target: [number, number, number];
}

export interface CameraEditRequest {
  subjectImage: string;
  backgroundImage: string | null;
  prompt?: string;
  model: string;
  camera: CameraParameters;
  renderPreset: string;
}

export interface CameraEditResponse {
  id: string;
  afterImageBase64: string;
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  thumbnail: string;
  afterImage: string;
  subjectImage: string;
  backgroundImage: string | null;
  camera: CameraParameters;
  model: string;
  renderPreset: string;
  createdAt: number;
}

export type RenderPreset = '产品图' | '人像' | '场景' | '电商海报' | '质感棚拍';

export interface ModelOption {
  label: string;
  value: string;
  price: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
  { label: 'Nano-Banana-Pro', value: 'nano-banana-pro', price: '$0.14-$0.24' },
  { label: 'Flux-Pro-Max', value: 'flux-pro-max', price: '$0.25-$0.40' },
  { label: 'SD-XL-Turbo', value: 'sd-xl-turbo', price: '$0.08-$0.15' },
];

export const RENDER_PRESETS: RenderPreset[] = [
  '产品图',
  '人像',
  '场景',
  '电商海报',
  '质感棚拍',
];

export const LENS_PRESETS = [
  { label: '35mm', value: 35, fov: 54 },
  { label: '50mm', value: 50, fov: 40 },
  { label: '85mm', value: 85, fov: 24 },
];

export const DEFAULT_CAMERA: CameraParameters = {
  fov: 40,
  focalLengthMm: 50,
  distance: 5,
  pitch: 0,
  yaw: 0,
  roll: 0,
  position: [0, 2, 5],
  target: [0, 1, 0],
};
