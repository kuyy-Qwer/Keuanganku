import { useState, useRef, useEffect, useCallback } from "react";

interface BarcodeScannerProps {
  onClose: () => void;
  onScan: (data: string) => void;
}

export default function BarcodeScanner({ onClose, onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const barcodeDetectorRef = useRef<BarcodeDetector | null>(null);

  const handleScanResult = useCallback((code: string) => {
    if (!scanned && code) {
      setScanned(true);
      setIsScanning(false);
      // Stop camera
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      onScan(code);
    }
  }, [scanned, onScan]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number | null = null;

    async function startCamera() {
      try {
        // Check if BarcodeDetector is available
        if ('BarcodeDetector' in window) {
          barcodeDetectorRef.current = new (window as any).BarcodeDetector({
            formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'code_93', 'upc_a', 'upc_e', 'itf', 'codabar']
          });
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsScanning(true);
        }
      } catch (err: any) {
        console.error("Camera error:", err);
        setHasCamera(false);
        setError("Tidak dapat mengakses kamera: " + (err.message || "Unknown error"));
      }
    }

    async function scanFrame() {
      if (!barcodeDetectorRef.current || !videoRef.current || !isScanning) return;
      
      try {
        const video = videoRef.current;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          const barcodes = await barcodeDetectorRef.current.detect(video);
          if (barcodes.length > 0) {
            handleScanResult(barcodes[0].rawValue);
            return;
          }
        }
      } catch (err) {
        console.error("Scan error:", err);
      }
      
      if (isScanning) {
        animationId = requestAnimationFrame(scanFrame);
      }
    }

    startCamera().then(() => {
      if (barcodeDetectorRef.current) {
        scanFrame();
      }
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [handleScanResult, isScanning]);

  const handleClose = () => {
    setIsScanning(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleScanResult(manualInput.trim());
    }
  };

  const toggleTorch = async () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getTracks()[0];
      const capabilities = track.getCapabilities() as any;
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn } as MediaTrackConstraintSet]
        });
        setTorchOn(!torchOn);
      }
    }
  };

  if (showManualInput) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col p-4">
        <div className="mt-8 mb-4 flex items-center gap-3">
          <button onClick={() => setShowManualInput(false)} className="p-2">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-white text-[18px] font-['Inter'] font-semibold">Input Manual</h2>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-[320px] space-y-4">
            <p className="text-white/70 text-[14px] text-center">Masukkan kode barcode atau nama item</p>
            <input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Kode barcode / Nama item..."
              className="w-full h-[50px] px-4 rounded-[16px] bg-[#1a1a1a] border border-white/20 text-white text-[16px] outline-none"
              autoFocus
            />
            <button
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
              className="w-full h-[50px] rounded-[16px] bg-[#4edea3] text-[#003824] font-['Inter'] font-semibold text-[16px] disabled:opacity-50">
              Tambah Item
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
        <button 
          onClick={handleClose}
          className="size-10 rounded-full bg-black/50 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button 
          onClick={toggleTorch}
          className={`size-10 rounded-full flex items-center justify-center ${torchOn ? 'bg-yellow-500' : 'bg-black/50'}`}>
          <span className="text-[20px]">{torchOn ? "🔦" : "💡"}</span>
        </button>
      </div>

      {/* Camera Feed */}
      <div className="flex-1 relative">
        {error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <span className="text-[64px] block mb-4">📷</span>
              <p className="text-white text-[16px] font-['Inter']">{error}</p>
              <button 
                onClick={handleClose}
                className="mt-6 px-6 py-3 rounded-[16px] bg-[#ffb4ab] text-[#003824] font-['Inter'] font-semibold">
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-[280px] h-[180px]">
                {/* Corner markers */}
                <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-[#4edea3] rounded-tl-lg" />
                <div className="absolute -top-2 -right-2 w-8 h-4 border-t-4 border-r-4 border-[#4edea3] rounded-tr-lg" />
                <div className="absolute -bottom-2 -left-2 w-8 h-4 border-b-4 border-l-4 border-[#4edea3] rounded-bl-lg" />
                <div className="absolute -bottom-2 -right-2 w-8 h-4 border-b-4 border-r-4 border-[#4edea3] rounded-br-lg" />
                
                {/* Scanning line */}
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#4edea3] to-transparent animate-pulse" 
                       style={{ animation: 'scanLine 2s ease-in-out infinite' }} />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-24 left-0 right-0 text-center pointer-events-none">
              <p className="text-white text-[14px] font-['Inter'] bg-black/50 py-2 px-4 rounded-full inline-block">
                Arahkan barcode ke dalam kotak
              </p>
            </div>

            {/* Status indicator */}
            <div className="absolute top-20 left-0 right-0 flex justify-center">
              {isScanning && (
                <span className="px-4 py-1 rounded-full bg-[#4edea3]/20 text-[#4edea3] text-[12px] font-['Inter']">
                  🔄 Mendeteksi...
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Manual Input Option */}
      <div className="p-4 bg-black/80 backdrop-blur-sm">
        <button 
          onClick={() => setShowManualInput(true)}
          className="w-full py-3 rounded-[16px] border border-white/20 text-white font-['Inter'] font-semibold text-[14px]">
          Input Manual
        </button>
      </div>
      
      <style>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(-80px); }
          50% { transform: translateY(80px); }
        }
      `}</style>
    </div>
  );
}