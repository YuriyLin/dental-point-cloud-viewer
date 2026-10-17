import React, { useCallback, useRef, useState } from 'react';
import { AlertCircle, Check, Download, FileUp, LoaderCircle, RotateCcw, ScanLine } from 'lucide-react';
import { segmentSTL } from '../services/apiService';
import type { JawType, SegmentationResult } from '../services/apiService';

interface AIDemoProps { onResult?: (data: SegmentationResult) => void; }
const ACCEPTED_EXTENSIONS = ['.stl', '.ply', '.obj'];

const AIDemo: React.FC<AIDemoProps> = ({ onResult }) => {
  const [file, setFile] = useState<File | null>(null);
  const [jawType, setJawType] = useState<JawType>('auto');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SegmentationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const chooseFile = useCallback((selectedFile: File | undefined) => {
    if (!selectedFile) return;
    const extension = `.${selectedFile.name.split('.').pop()?.toLowerCase()}`;
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setError('目前只接受 STL、PLY 或 OBJ 檔案。');
      return;
    }
    setFile(selectedFile);
    setResult(null);
    setError(null);
  }, []);

  const runAnalysis = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await segmentSTL(file, jawType);
      setResult(data);
      onResult?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分割服務發生未知錯誤，請稍後重試。');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const averageConfidence = result?.results.length
    ? result.results.reduce((total, item) => total + item.confidence, 0) / result.results.length
    : 0;

  return (
    <div className="analysis-panel">
      <div className="panel-header">
        <div><div className="panel-kicker"><ScanLine size={15} aria-hidden="true" /> SEGMENTATION INPUT</div><h3>匯入掃描模型</h3></div>
        <span className="panel-index">A / 01</span>
      </div>

      <div className="upload-zone-wrap">
        <input ref={inputRef} id="scan-file" className="visually-hidden" type="file" accept=".stl,.ply,.obj" onChange={(event) => chooseFile(event.target.files?.[0])} />
        <label
          htmlFor="scan-file"
          className={`upload-zone ${dragActive ? 'upload-zone--active' : ''} ${file ? 'upload-zone--selected' : ''}`}
          onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => { event.preventDefault(); setDragActive(false); }}
          onDrop={(event) => { event.preventDefault(); setDragActive(false); chooseFile(event.dataTransfer.files?.[0]); }}
        >
          <span className="upload-icon">{file ? <Check size={22} aria-hidden="true" /> : <FileUp size={22} aria-hidden="true" />}</span>
          <span className="upload-copy"><strong>{file ? file.name : '選擇或拖放掃描檔案'}</strong><small>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB / 已準備匯入` : '支援 STL、PLY、OBJ'}</small></span>
          <span className="upload-action">{file ? '更換檔案' : '瀏覽檔案'}</span>
        </label>
      </div>

      <div className="controls-row">
        <label className="field-label" htmlFor="jaw-type">顎別</label>
        <select id="jaw-type" value={jawType} onChange={(event) => setJawType(event.target.value as JawType)}>
          <option value="auto">自動判斷</option><option value="upper">上顎</option><option value="lower">下顎</option>
        </select>
        <span className="field-hint">手動指定可避免顎別判斷歧義</span>
      </div>

      <div className="analysis-actions">
        <button className="primary-button" type="button" onClick={runAnalysis} disabled={!file || loading}>
          {loading ? <><LoaderCircle size={17} className="spin" aria-hidden="true" /> 模型推論中</> : <><ScanLine size={17} aria-hidden="true" /> 執行 AI 分割</>}
        </button>
        {file && <button className="ghost-button" type="button" onClick={reset} disabled={loading}><RotateCcw size={16} aria-hidden="true" /> 清除</button>}
      </div>

      {loading && <p className="progress-note" role="status" aria-live="polite">正在取樣、分割並建立可視化輸出，請稍候。</p>}
      {error && <div className="error-message" role="alert"><AlertCircle size={17} aria-hidden="true" /><span>{error}</span></div>}

      <div className="result-block" aria-live="polite">
        <div className="result-block-header"><div><p className="panel-kicker">PREDICTION SUMMARY</p><h4>{result ? '分割結果' : '尚未產生結果'}</h4></div>{result && <span className="result-state"><span className="status-dot" /> COMPLETE</span>}</div>
        {!result ? <p className="empty-copy">完成一次推論後，這裡會顯示牙位數量、點數與信心度摘要。</p> : <>
          <div className="metric-strip">
            <div><span>JAW</span><strong>{result.jaw_type === 'upper' ? '上顎' : result.jaw_type === 'lower' ? '下顎' : '未指定'}</strong></div>
            <div><span>TEETH</span><strong>{result.results.length}</strong></div>
            <div><span>POINTS</span><strong>{result.num_points?.toLocaleString() ?? '—'}</strong></div>
            <div><span>MEAN CONF.</span><strong>{(averageConfidence * 100).toFixed(1)}%</strong></div>
          </div>
          <div className="tooth-list" aria-label="牙位預測清單">
            {result.results.map((item) => <div className="tooth-row" key={item.toothId}><span className="tooth-id">{item.toothId}</span><span className="tooth-name">{item.description}</span><span className="confidence"><span style={{ width: `${Math.max(2, item.confidence * 100)}%` }} /><b>{(item.confidence * 100).toFixed(1)}%</b></span></div>)}
          </div>
          <a className="download-link" href={result.download_url} target="_blank" rel="noreferrer"><Download size={16} aria-hidden="true" /> 下載分割後 PLY</a>
        </>}
      </div>
    </div>
  );
};

export default AIDemo;
