import React, { useState, useEffect } from 'react';
import { X, Zap, Loader2, Check } from 'lucide-react';
import { AppNode } from '../types';
import { AssetPanel } from './cameraStudio/AssetPanel';
import { Viewport3D } from './cameraStudio/Viewport3D';
import { ResultPanel } from './cameraStudio/ResultPanel';
import { CameraParameters, DEFAULT_CAMERA, RenderPreset, MODEL_OPTIONS } from '../types/camera';
import { mockCameraEdit } from '../services/cameraEditService';

interface CameraStudioExpandedProps {
  node: AppNode;
  onClose: () => void;
  onUpdate: (data: any) => void;
}

export const CameraStudioExpanded: React.FC<CameraStudioExpandedProps> = ({ node, onClose, onUpdate }) => {
  const [subjectImage, setSubjectImage] = useState<string | null>(node.data.subjectImage || null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(node.data.backgroundImage || null);
  const [model, setModel] = useState(node.data.model || MODEL_OPTIONS[0].value);
  const [renderPreset, setRenderPreset] = useState<RenderPreset>(
    (node.data.renderPreset as RenderPreset) || '产品图'
  );
  const [camera, setCamera] = useState<CameraParameters>(node.data.cameraParams || DEFAULT_CAMERA);
  const [afterImage, setAfterImage] = useState<string | null>(node.data.image || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [visible, setVisible] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('camera_studio_node_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  };

  const saveToHistory = (result: string, params: any) => {
    const item = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      thumbnail: result,
      afterImage: result,
      subjectImage,
      backgroundImage,
      camera: params.camera,
      model: params.model,
      renderPreset: params.renderPreset,
      createdAt: Date.now(),
    };

    const updated = [item, ...history].slice(0, 20);
    setHistory(updated);
    localStorage.setItem('camera_studio_node_history', JSON.stringify(updated));
  };

  const handleGenerate = async () => {
    if (!subjectImage || isGenerating) return;

    setIsGenerating(true);

    try {
      const response = await mockCameraEdit({
        subjectImage,
        backgroundImage,
        model,
        renderPreset,
        camera,
      });

      setAfterImage(response.afterImageBase64);

      onUpdate({
        subjectImage,
        backgroundImage,
        model,
        renderPreset,
        cameraParams: camera,
        image: response.afterImageBase64,
        status: 'SUCCESS',
      });

      saveToHistory(response.afterImageBase64, { camera, model, renderPreset });
    } catch (error) {
      console.error('Generation failed:', error);
      alert('生成失败，请重试');
      onUpdate({ status: 'ERROR', error: '生成失败' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleHistoryItemClick = (item: any) => {
    setSubjectImage(item.subjectImage);
    setBackgroundImage(item.backgroundImage);
    setModel(item.model);
    setRenderPreset(item.renderPreset);
    setCamera(item.camera);
    setAfterImage(item.afterImage);
  };

  const handleHistoryUpdate = () => {
    loadHistory();
  };

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        visible ? 'bg-black/90 backdrop-blur-xl' : 'bg-transparent pointer-events-none opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full h-full flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-black/60 hover:bg-red-500 backdrop-blur-md flex items-center justify-center text-white transition-colors shadow-2xl"
        >
          <X size={24} />
        </button>

        {/* Top Bar */}
        <div className="h-16 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-black text-white">3D 摄影棚</h1>
            <p className="text-xs text-slate-500">Camera Studio · AI-Powered Image Editor</p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!subjectImage || isGenerating}
            className={`px-8 py-3 rounded-xl flex items-center gap-3 text-base font-bold shadow-xl transition-all ${
              subjectImage && !isGenerating
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-105 hover:shadow-cyan-500/30'
                : 'bg-white/5 text-slate-600 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Zap size={20} fill="currentColor" />
                生成
              </>
            )}
          </button>
        </div>

        {/* Main Content - Three Columns */}
        <div className="flex-1 flex overflow-hidden">
          <AssetPanel
            subjectImage={subjectImage}
            backgroundImage={backgroundImage}
            model={model}
            renderPreset={renderPreset}
            onSubjectImageChange={setSubjectImage}
            onBackgroundImageChange={setBackgroundImage}
            onModelChange={setModel}
            onRenderPresetChange={setRenderPreset}
          />

          <Viewport3D camera={camera} onCameraChange={setCamera} />

          <ResultPanel
            subjectImage={subjectImage}
            afterImage={afterImage}
            history={history}
            onHistoryItemClick={handleHistoryItemClick}
            onHistoryUpdate={handleHistoryUpdate}
          />
        </div>
      </div>
    </div>
  );
};
