import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { MODEL_OPTIONS, RENDER_PRESETS, RenderPreset } from '../../types/camera';
import { fileToBase64 } from '../../utils/image';

interface AssetPanelProps {
  subjectImage: string | null;
  backgroundImage: string | null;
  model: string;
  renderPreset: RenderPreset;
  onSubjectImageChange: (image: string | null) => void;
  onBackgroundImageChange: (image: string | null) => void;
  onModelChange: (model: string) => void;
  onRenderPresetChange: (preset: RenderPreset) => void;
}

export const AssetPanel: React.FC<AssetPanelProps> = ({
  subjectImage,
  backgroundImage,
  model,
  renderPreset,
  onSubjectImageChange,
  onBackgroundImageChange,
  onModelChange,
  onRenderPresetChange,
}) => {
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const handleSubjectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      onSubjectImageChange(base64);
    }
    e.target.value = '';
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      onBackgroundImageChange(base64);
    }
    e.target.value = '';
  };

  const handleSubjectDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const base64 = await fileToBase64(file);
      onSubjectImageChange(base64);
    }
  };

  const handleBackgroundDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const base64 = await fileToBase64(file);
      onBackgroundImageChange(base64);
    }
  };

  return (
    <div className="w-80 h-full bg-[#0a0a0c] border-r border-white/10 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-lg font-bold text-white">素材区</h2>
        <p className="text-xs text-slate-500 mt-1">上传主体和背景图片</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {/* Subject Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">主体图片</h3>
            <span className="text-xs text-red-400">必选</span>
          </div>

          <div
            className={`relative h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
              subjectImage
                ? 'border-cyan-500/50 bg-cyan-500/5'
                : 'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10'
            }`}
            onClick={() => !subjectImage && subjectInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleSubjectDrop}
          >
            <input
              ref={subjectInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSubjectUpload}
            />

            {subjectImage ? (
              <>
                <img
                  src={subjectImage}
                  alt="Subject"
                  className="w-full h-full object-contain rounded-xl"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSubjectImageChange(null);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
                >
                  <X size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    subjectInputRef.current?.click();
                  }}
                  className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-cyan-500 flex items-center gap-1 text-white text-xs font-medium transition-colors"
                >
                  <Upload size={12} />
                  更换
                </button>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <ImageIcon size={32} className="text-slate-500" />
                <span className="text-sm font-medium text-slate-400">点击上传主体图片</span>
                <span className="text-xs text-slate-600">或拖拽文件到此处</span>
              </div>
            )}
          </div>
        </div>

        {/* Background Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">背景图片</h3>
            <span className="text-xs text-slate-500">可选</span>
          </div>

          <div
            className={`relative h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
              backgroundImage
                ? 'border-purple-500/50 bg-purple-500/5'
                : 'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10'
            }`}
            onClick={() => !backgroundImage && backgroundInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleBackgroundDrop}
          >
            <input
              ref={backgroundInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBackgroundUpload}
            />

            {backgroundImage ? (
              <>
                <img
                  src={backgroundImage}
                  alt="Background"
                  className="w-full h-full object-contain rounded-xl"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBackgroundImageChange(null);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
                >
                  <X size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    backgroundInputRef.current?.click();
                  }}
                  className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-purple-500 flex items-center gap-1 text-white text-xs font-medium transition-colors"
                >
                  <Upload size={12} />
                  更换
                </button>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <ImageIcon size={32} className="text-slate-500" />
                <span className="text-sm font-medium text-slate-400">点击上传背景图片</span>
                <span className="text-xs text-slate-600">或拖拽文件到此处</span>
              </div>
            )}
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">模型</h3>
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full px-4 py-3 bg-[#1c1c1e] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-colors"
          >
            {MODEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.price})
              </option>
            ))}
          </select>
        </div>

        {/* Render Preset */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">参数预设</h3>
          <select
            value={renderPreset}
            onChange={(e) => onRenderPresetChange(e.target.value as RenderPreset)}
            className="w-full px-4 py-3 bg-[#1c1c1e] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-colors"
          >
            {RENDER_PRESETS.map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
