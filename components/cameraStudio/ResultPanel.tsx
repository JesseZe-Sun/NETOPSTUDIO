import React, { useState, useRef } from 'react';
import { Download, ExternalLink, ImageIcon, Clock } from 'lucide-react';
import { downloadImage, openImageInNewTab } from '../../utils/image';

interface HistoryItem {
  id: string;
  thumbnail: string;
  afterImage: string;
  createdAt: number;
}

interface ResultPanelProps {
  subjectImage: string | null;
  afterImage: string | null;
  history: HistoryItem[];
  onHistoryItemClick: (item: HistoryItem) => void;
  onHistoryUpdate: () => void;
}

type TabType = 'after' | 'before' | 'compare';

export const ResultPanel: React.FC<ResultPanelProps> = ({
  subjectImage,
  afterImage,
  history,
  onHistoryItemClick,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('after');
  const [comparePosition, setComparePosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const compareContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !compareContainerRef.current) return;

    const rect = compareContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setComparePosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleDownload = () => {
    if (afterImage) {
      downloadImage(afterImage, `camera_studio_${Date.now()}.jpg`);
    }
  };

  const handleOpen = () => {
    if (afterImage) {
      openImageInNewTab(afterImage);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-96 h-full bg-[#0a0a0c] border-l border-white/10 flex flex-col overflow-hidden">
      <div className="h-14 px-4 border-b border-white/10 flex items-center gap-1 bg-black/20">
        <button
          onClick={() => setActiveTab('after')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
            activeTab === 'after' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          效果图
        </button>
        <button
          onClick={() => setActiveTab('before')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
            activeTab === 'before' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          原图
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
            activeTab === 'compare' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          对比图
        </button>
      </div>

      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex-1 bg-[#1c1c1e] rounded-xl border border-white/10 overflow-hidden relative">
          {activeTab === 'after' && (
            <div className="w-full h-full flex items-center justify-center">
              {afterImage ? (
                <img src={afterImage} alt="After" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-600">
                  <ImageIcon size={48} strokeWidth={1} />
                  <span className="text-sm font-medium">After (generated image)</span>
                  <span className="text-xs">No image yet</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'before' && (
            <div className="w-full h-full flex items-center justify-center">
              {subjectImage ? (
                <img src={subjectImage} alt="Before" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-600">
                  <ImageIcon size={48} strokeWidth={1} />
                  <span className="text-sm font-medium">Before (subject image)</span>
                  <span className="text-xs">No image uploaded</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'compare' && (
            <div
              ref={compareContainerRef}
              className="w-full h-full relative cursor-col-resize select-none"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseUp}
            >
              {subjectImage && afterImage ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img src={subjectImage} alt="Before" className="max-w-full max-h-full object-contain" />
                  </div>

                  <div
                    className="absolute inset-0 flex items-center justify-center overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }}
                  >
                    <img src={afterImage} alt="After" className="max-w-full max-h-full object-contain" />
                  </div>

                  <div
                    className="absolute top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                    style={{ left: `${comparePosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cyan-500 border-2 border-white shadow-lg flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>

                  <div className="absolute top-4 left-4 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-bold text-white">
                    Before
                  </div>
                  <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-bold text-white">
                    After
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
                  <ImageIcon size={48} strokeWidth={1} />
                  <span className="text-sm font-medium">Before vs After</span>
                  <span className="text-xs">Generate an image first</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleDownload}
            disabled={!afterImage}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              afterImage
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                : 'bg-white/5 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Download size={16} />
            下载
          </button>
          <button
            onClick={handleOpen}
            disabled={!afterImage}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              afterImage
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                : 'bg-white/5 text-slate-600 cursor-not-allowed'
            }`}
          >
            <ExternalLink size={16} />
            打开
          </button>
        </div>
      </div>

      <div className="h-64 border-t border-white/10 flex flex-col">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock size={14} />
            历史记录
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600">
              <Clock size={32} strokeWidth={1} />
              <span className="text-xs mt-2">暂无历史记录</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onHistoryItemClick(item)}
                  className="relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-cyan-500/50 cursor-pointer transition-colors group"
                >
                  <img src={item.thumbnail} alt="History" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
