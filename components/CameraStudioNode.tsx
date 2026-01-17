import React, { useRef } from 'react';
import { Camera, Upload, Maximize2, Settings } from 'lucide-react';
import { AppNode, NodeStatus } from '../types';
import { fileToBase64 } from '../utils/image';

interface CameraStudioNodeProps {
  node: AppNode;
  onUpdate: (data: any, size?: any, title?: string) => void;
  onExpand: () => void;
}

export const CameraStudioNode: React.FC<CameraStudioNodeProps> = ({ node, onUpdate, onExpand }) => {
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const handleSubjectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      onUpdate({ subjectImage: base64 });
    }
    e.target.value = '';
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      onUpdate({ backgroundImage: base64 });
    }
    e.target.value = '';
  };

  const getCameraDescription = () => {
    if (!node.data.cameraParams) return 'Default camera';
    const { focalLengthMm, pitch, yaw } = node.data.cameraParams;
    let view = Math.abs(yaw) < 15 ? 'Front' : Math.abs(yaw) > 165 ? 'Back' : yaw > 0 ? 'Right' : 'Left';
    let angle = pitch > 15 ? 'High' : pitch < -15 ? 'Low' : 'Eye';
    return `${focalLengthMm}mm · ${view} · ${angle}`;
  };

  return (
    <div className="relative w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <input
        ref={subjectInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSubjectUpload}
      />
      <input
        ref={backgroundInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBackgroundUpload}
      />

      {/* Header */}
      <div className="px-4 py-3 bg-black/20 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-cyan-400" />
          <span className="text-sm font-bold text-white">3D 摄影棚</span>
        </div>
        <button
          onClick={onExpand}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          title="展开编辑"
        >
          <Maximize2 size={14} className="text-slate-400" />
        </button>
      </div>

      {/* Preview Area */}
      <div className="relative aspect-video bg-black/40">
        {node.data.image ? (
          <img
            src={node.data.image}
            alt="Result"
            className="w-full h-full object-cover"
          />
        ) : node.data.subjectImage ? (
          <div className="relative w-full h-full">
            <img
              src={node.data.subjectImage}
              alt="Subject"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Camera size={32} className="text-cyan-400 mb-2 mx-auto" />
                <span className="text-xs text-slate-400">点击"展开编辑"开始设计</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Camera size={40} className="text-slate-600" strokeWidth={1} />
            <span className="text-sm font-medium text-slate-500">Camera Studio</span>
            <button
              onClick={() => subjectInputRef.current?.click()}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
            >
              <Upload size={12} />
              上传主体图片
            </button>
          </div>
        )}

        {/* Status Badge */}
        {node.status === NodeStatus.WORKING && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-cyan-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white animate-pulse">
            生成中...
          </div>
        )}
        {node.status === NodeStatus.SUCCESS && node.data.image && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white">
            ✓ 完成
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="p-4 space-y-3">
        {/* Subject/Background */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => subjectInputRef.current?.click()}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
              node.data.subjectImage
                ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                : 'border-white/10 bg-white/5 text-slate-500 hover:bg-white/10'
            }`}
          >
            {node.data.subjectImage ? '✓ 主体图片' : '+ 主体图片'}
          </button>
          <button
            onClick={() => backgroundInputRef.current?.click()}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
              node.data.backgroundImage
                ? 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                : 'border-white/10 bg-white/5 text-slate-500 hover:bg-white/10'
            }`}
          >
            {node.data.backgroundImage ? '✓ 背景图片' : '+ 背景图片'}
          </button>
        </div>

        {/* Camera Info */}
        {node.data.cameraParams && (
          <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 text-xs">
              <Settings size={12} className="text-slate-400" />
              <span className="font-mono text-slate-300">{getCameraDescription()}</span>
            </div>
          </div>
        )}

        {/* Preset */}
        {node.data.renderPreset && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">预设</span>
            <span className="font-medium text-slate-300">{node.data.renderPreset}</span>
          </div>
        )}

        {/* Edit Button */}
        <button
          onClick={onExpand}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-sm font-bold transition-all hover:scale-[1.02] shadow-lg"
        >
          展开编辑
        </button>
      </div>
    </div>
  );
};
