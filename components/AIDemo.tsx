/**
 * AIDemo Component - AI Dental Segmentation Interface
 * 
 * This component provides:
 * - File upload for STL/PLY dental scans
 * - Backend API calls for AI segmentation
 * - Download segmented results
 */

import React, { useState, useRef, useCallback } from 'react';
import { FileCode, RefreshCw, AlertCircle, ChevronRight, Activity, Layers, Download } from 'lucide-react';
import { segmentSTL } from '../services/apiService';
import { AnalysisResponse } from '../types';

// Extended response type with additional fields from enhanced API
interface ExtendedAnalysisResponse extends AnalysisResponse {
  download_url?: string;
  metadata_url?: string;
  task_id?: string;
}
interface AIDemoProps {
  onResult?: (data: any) => void;
}

const AIDemo: React.FC<AIDemoProps> = ({ onResult }) => {
  // === STATE ===
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtendedAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // === HANDLERS ===
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
      setPreview(selectedFile.name);
    }
  }, []);

  const runAnalysis = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await segmentSTL(file);
      setResult(data);
      if (onResult) onResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "分析過程中發生錯誤，請重試。");
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  }, []);

  const downloadResult = () => {
    if (result?.download_url) {
      window.open(result.download_url, '_blank');
    }
  };

  // === RENDER ===
  return (
    <section id="demo-section" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ffc93b]/10 text-[#ff8538] rounded-full text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" /> 3D IOS Segmentation
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-[#3c3c3c]">口內掃描 AI 自動分割</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            上傳您的口內掃描模型檔案（STL），即時查看 AI 牙位辨識與分割狀況 。
          </p>
        </div>

        <div className="bg-[#fcfcfc] rounded-[40px] shadow-2xl shadow-gray-200/50 overflow-hidden grid lg:grid-cols-2 border border-gray-100">
          {/* Left: Interactive Area */}
          <div className="p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            {!preview ? (
              /* === Upload Zone === */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-[450px] border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-[#ffc93b] hover:bg-[#ffc93b]/5 transition-all group relative overflow-hidden"
              >
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-[#ffc93b] group-hover:text-white transition-all shadow-sm">
                  <FileCode className="w-10 h-10" />
                </div>
                <div className="text-center z-10">
                  <p className="font-bold text-xl text-[#3c3c3c]">導入口內掃描模型</p>
                  <p className="text-gray-400 text-sm mt-2">點擊或拖放 STL 檔案</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".stl,.ply,.obj"
                />
              </div>
            ) : (
              /* === Preview Area === */
              <div className="space-y-6">
                <div className="relative h-[450px] rounded-[32px] overflow-hidden bg-[#1a1a1a] shadow-inner">
                  {/* File Preview */}
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <FileCode className="w-20 h-20 mb-6 opacity-50" />
                    <p className="text-xl font-medium text-white">{file?.name}</p>
                    <p className="text-sm opacity-60 mt-2">
                      {result ? '分析完成！可下載分割結果' : '點擊下方按鈕開始分析'}
                    </p>
                    {result && (
                      <div className="mt-6 flex items-center gap-2 text-[#ffc93b]">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-bold">AI 分析已完成</span>
                      </div>
                    )}
                  </div>

                  {/* Loading Overlay */}
                  {loading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white gap-4 z-10">
                      <div className="relative">
                        <Activity className="w-16 h-16 text-[#ffc93b] animate-pulse" />
                        <div className="absolute inset-0 border-4 border-[#ff8538] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="font-bold text-lg tracking-wider">AI 模型解析中</p>
                        <p className="text-xs text-gray-400">正在標記牙齒座標與邊界...</p>
                      </div>
                    </div>
                  )}

                  {/* Grid overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {!result ? (
                    <button
                      onClick={runAnalysis}
                      disabled={loading}
                      className="flex-1 bg-[#ffc93b] hover:bg-[#ffb500] text-[#3c3c3c] font-bold py-5 rounded-2xl transition-all shadow-xl shadow-yellow-100 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                    >
                      運行 AI 牙齒分割
                    </button>
                  ) : (
                    <button
                      onClick={reset}
                      className="flex-1 border-2 border-gray-100 hover:border-gray-200 text-gray-500 font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3"
                    >
                      <RefreshCw className="w-5 h-5" /> 重新導入模型
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Results Panel */}
          <div className="p-8 lg:p-12">
            <h3 className="text-2xl font-bold mb-10 flex items-center gap-3 text-[#3c3c3c]">
              <span className="w-1.5 h-8 bg-[#ffc93b] rounded-full"></span>
              IOS 智慧標註報告
            </h3>

            {!result ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12 opacity-40">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center">
                  <Layers className="w-10 h-10 text-gray-300" />
                </div>
                <div className="max-w-[260px]">
                  <p className="font-medium text-gray-500">等待模型導入</p>
                  <p className="text-sm text-gray-400 mt-2">分析完成後將顯示牙齒分割結果與健康狀態。</p>
                </div>
              </div>
            ) : (
              /* Results Display */
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700">
                {/* Summary Card */}
                <div className="bg-[#3c3c3c] p-6 rounded-3xl text-white shadow-lg">
                  <div className="flex items-center gap-2 text-[#ffc93b] mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">AI Analysis Complete</span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-300">{result.summary}</p>
                </div>

                {/* Teeth List - scrollable */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {result.results.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between group hover:shadow-md hover:border-[#ffc93b]/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${item.condition === 'healthy' ? 'bg-green-100 text-green-600' :
                          item.condition === 'warning' ? 'bg-[#ffc93b]/20 text-[#ff8538]' : 'bg-red-100 text-red-600'
                          }`}>
                          #{item.toothId}
                        </div>
                        <div>
                          <p className="font-bold text-[#3c3c3c] text-sm">{item.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#ffc93b]" style={{ width: `${item.confidence * 100}%` }}></div>
                            </div>
                            <span className="text-[10px] text-gray-400">信心度 {(item.confidence * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
                </div>

                {/* Export Button */}
                <div className="pt-4">
                  <button
                    onClick={downloadResult}
                    className="w-full py-4 bg-[#ffc93b] text-[#3c3c3c] rounded-2xl font-bold hover:shadow-xl hover:shadow-yellow-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    導出分割後的 PLY 檔案
                  </button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper SVG icon
const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
);

export default AIDemo;
