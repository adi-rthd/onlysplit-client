import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Smartphone,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

import { isInAppBrowser, getInAppBrowserName, isAndroid } from '../utils/browserDetect';
import {
  getApkInfo,
  buildChromeIntentUrl,
  triggerDirectDownload,
  copyDownloadLink,
} from '../utils/downloadUtils';
import analyticsService from '../services/analyticsService';
import { ROUTES } from '../constants/routes';

const DownloadPage = () => {
  const navigate = useNavigate();

  const [apkInfo, setApkInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInApp, setIsInApp] = useState(false);
  const [browserName, setBrowserName] = useState(null);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      // Detect browser environment
      const inApp = isInAppBrowser();
      const name = getInAppBrowserName();
      setIsInApp(inApp);
      setBrowserName(name);

      // Log analytics
      analyticsService.trackDownloadEvent('download_page_loaded', {
        isInAppBrowser: inApp,
        browserName: name,
        isAndroid: isAndroid(),
        userAgent: navigator.userAgent,
      });

      if (inApp) {
        analyticsService.trackDownloadEvent('inapp_browser_detected', {
          browserName: name,
        });
      }

      // Fetch APK info
      try {
        const info = await getApkInfo();
        if (info) {
          setApkInfo(info);

          // Auto-trigger download for standard browsers
          if (!inApp) {
            setTimeout(() => {
              triggerDirectDownload(info.apkUrl);
              setDownloadStarted(true);
              analyticsService.trackDownloadEvent('direct_download_attempted', {
                apkUrl: info.apkUrl,
                auto: true,
              });
            }, 500);
          }
        } else {
          setError('Could not fetch download information. Please try again later.');
        }
      } catch {
        setError('Failed to load download details.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleOpenInChrome = () => {
    if (!apkInfo?.apkUrl) return;
    const intentUrl = buildChromeIntentUrl(apkInfo.apkUrl);
    analyticsService.trackDownloadEvent('open_in_chrome_clicked', {
      apkUrl: apkInfo.apkUrl,
    });
    window.location.href = intentUrl;
  };

  const handleCopyLink = async () => {
    if (!apkInfo?.apkUrl) return;
    const success = await copyDownloadLink(apkInfo.apkUrl);
    setCopied(success);
    analyticsService.trackDownloadEvent('copy_link_clicked', {
      apkUrl: apkInfo.apkUrl,
      success,
    });
    if (success) {
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleContinueAnyway = () => {
    if (!apkInfo?.apkUrl) return;
    analyticsService.trackDownloadEvent('direct_download_attempted', {
      apkUrl: apkInfo.apkUrl,
      auto: false,
      isInAppBrowser: true,
    });
    triggerDirectDownload(apkInfo.apkUrl);
    setDownloadStarted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05060a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-white/60">Loading download info...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#05060a] flex items-center justify-center text-white px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <h1 className="text-2xl font-bold">{error}</h1>
          <button
            onClick={() => navigate(ROUTES.LANDING)}
            className="px-6 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05060a] text-white px-4 py-12 flex flex-col items-center">
      {/* Background glow */}
      <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(94,92,230,0.08)_0%,transparent_90%)] blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto">
            <img src="/logo.png" alt="OnlySplit" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Download OnlySplit
          </h1>
          {apkInfo?.version && (
            <p className="text-white/50 text-sm">
              Version {apkInfo.version}
            </p>
          )}
        </div>

        {/* In-app browser warning */}
        {isInApp && !downloadStarted && (
          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-400 shrink-0 mt-0.5" size={20} />
              <div>
                <h2 className="font-semibold text-yellow-400">
                  {browserName ? `${browserName} browser detected` : 'In-app browser detected'}
                </h2>
                <p className="text-white/60 text-sm mt-1 leading-relaxed">
                  Your current browser may not support APK installation.
                  For the best experience, open this page in Chrome or copy the download link.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {/* Open in Chrome */}
              {isAndroid() && (
                <button
                  onClick={handleOpenInChrome}
                  className="w-full px-5 py-3.5 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <ExternalLink size={18} />
                  Open in Chrome
                </button>
              )}

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full px-5 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white font-medium flex items-center justify-center gap-2 hover:bg-white/[0.08] transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={18} className="text-lime-400" />
                    <span className="text-lime-400">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy Download Link
                  </>
                )}
              </button>

              {/* Continue Anyway */}
              <button
                onClick={handleContinueAnyway}
                className="w-full px-5 py-3.5 rounded-xl text-white/50 text-sm hover:text-white/70 transition-colors"
              >
                Continue anyway (may not work)
              </button>
            </div>
          </div>
        )}

        {/* Download started confirmation */}
        {downloadStarted && (
          <div className="rounded-2xl border border-lime-400/20 bg-lime-400/5 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Download className="text-lime-400 shrink-0 mt-0.5" size={20} />
              <div>
                <h2 className="font-semibold text-lime-400">Download started</h2>
                <p className="text-white/60 text-sm mt-1 leading-relaxed">
                  Check your notifications bar for download progress.
                  Once complete, tap the notification to install.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4 space-y-2">
              <h3 className="text-white/80 text-sm font-medium">Installation steps:</h3>
              <ol className="text-white/50 text-sm space-y-1.5 list-decimal list-inside">
                <li>Wait for download to complete</li>
                <li>Tap the downloaded file notification</li>
                <li>If prompted, allow &quot;Install from unknown sources&quot;</li>
                <li>Tap &quot;Install&quot; on the package installer</li>
              </ol>
            </div>
          </div>
        )}

        {/* Standard browser — auto download message */}
        {!isInApp && !downloadStarted && !error && (
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            <p className="text-white/60">Starting download...</p>
          </div>
        )}

        {/* Release notes */}
        {apkInfo?.releaseNotes?.length > 0 && (
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 space-y-3">
            <h3 className="text-white/80 font-semibold">What&apos;s new</h3>
            <ul className="space-y-1.5">
              {apkInfo.releaseNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                  <span className="text-primary mt-0.5">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Back link */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate(ROUTES.LANDING)}
            className="text-white/40 text-sm hover:text-white/60 transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            Back to OnlySplit
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
