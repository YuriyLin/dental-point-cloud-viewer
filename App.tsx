import { useEffect, useState } from 'react';
import { Activity, CircleCheck, CircleX, ScanLine } from 'lucide-react';
import AIDemo from './components/AIDemo';
import InteractiveViewer from './components/InteractiveViewer';
import { checkHealth } from './services/apiService';
import type { SegmentationResult } from './services/apiService';
import './app.css';

function App() {
  const [segmentResult, setSegmentResult] = useState<SegmentationResult | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ready' | 'offline'>('checking');

  useEffect(() => {
    checkHealth()
      .then((health) => setApiStatus(health.model_loaded ? 'ready' : 'offline'))
      .catch(() => setApiStatus('offline'));
  }, []);

  const statusLabel = {
    checking: '檢查推論服務',
    ready: '推論服務就緒',
    offline: '推論服務未連線',
  }[apiStatus];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">跳至主要內容</a>

      <header className="topbar">
        <a className="wordmark" href="/" aria-label="3D 牙齒分割工作台首頁">
          <span className="wordmark-mark"><ScanLine size={18} aria-hidden="true" /></span>
          <span>3D DENTAL SEGMENTATION</span>
        </a>
        <div className={`service-status service-status--${apiStatus}`} role="status" aria-live="polite">
          {apiStatus === 'ready' && <CircleCheck size={15} aria-hidden="true" />}
          {apiStatus === 'offline' && <CircleX size={15} aria-hidden="true" />}
          {apiStatus === 'checking' && <Activity size={15} aria-hidden="true" />}
          <span>{statusLabel}</span>
        </div>
      </header>

      <main id="main-content">
        <section className="intro-section" aria-labelledby="page-title">
          <div className="intro-copy">
            <p className="eyebrow">LOCAL INFERENCE WORKBENCH / 01</p>
            <h1 id="page-title">口內掃描<br /><span>AI 自動分割</span></h1>
            <p className="intro-lede">匯入口內掃描模型，執行牙齒語意分割，並在同一個工作區檢視預測點雲與牙位結果。</p>
          </div>
          <div className="intro-rail" aria-label="工作流程">
            <div className="rail-step rail-step--active"><span>01</span><strong>匯入</strong><small>STL / PLY / OBJ</small></div>
            <div className="rail-line" />
            <div className="rail-step"><span>02</span><strong>分割</strong><small>本地模型推論</small></div>
            <div className="rail-line" />
            <div className="rail-step"><span>03</span><strong>檢視</strong><small>3D 預測結果</small></div>
          </div>
        </section>

        <section className="workbench-section" aria-labelledby="workbench-title">
          <div className="section-heading">
            <div><p className="eyebrow">WORKSPACE / INPUT + OUTPUT</p><h2 id="workbench-title">建立一次分割任務</h2></div>
            <p className="section-note">結果只在本機開發服務中處理，不代表醫療診斷。</p>
          </div>
          <div className="workbench-grid">
            <AIDemo onResult={setSegmentResult} />
            <aside className="method-panel" aria-labelledby="method-title">
              <div className="panel-kicker"><span className="status-dot" /> PIPELINE</div>
              <h3 id="method-title">從掃描到可視化</h3>
              <p>目前工作台把模型輸出保留成可檢查的中間結果，方便確認每一步是否完成。</p>
              <ol className="method-list">
                <li><span>01</span><div><strong>檔案驗證</strong><small>確認格式與匯入內容</small></div></li>
                <li><span>02</span><div><strong>點雲分割</strong><small>使用本地 segmentation checkpoint</small></div></li>
                <li><span>03</span><div><strong>FDI 標籤</strong><small>整理牙位與 confidence</small></div></li>
                <li><span>04</span><div><strong>3D 檢視</strong><small>旋轉、縮放與切換表示方式</small></div></li>
              </ol>
              <div className="method-footnote"><span>MODEL OUTPUT</span><strong>17 classes / FDI mapping</strong></div>
            </aside>
          </div>
        </section>

        <InteractiveViewer
          key={`viewer-${segmentResult?.task_id || 'empty'}`}
          taskId={segmentResult?.task_id}
          hasMesh={segmentResult?.has_mesh}
          jawType={segmentResult?.jaw_type}
        />
      </main>

      <footer className="app-footer"><span>LOCAL DEMO</span><span>3D SEGMENTATION / VISUALIZATION</span><span>NO EXTERNAL BRANDING</span></footer>
    </div>
  );
}

export default App;
