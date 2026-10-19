import { useState, useRef, useCallback, useEffect } from "react";

export const useCamera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Matikan kamera saat pengguna berpindah fitur
  useEffect(() => stopCamera, [stopCamera]);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        // 'environment' = kamera belakang di HP
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        return true;
      }
      stream.getTracks().forEach((t) => t.stop());
      return false;
    } catch (err) {
      console.error(err);
      setCameraError("Kamera tidak bisa dinyalakan. Izinkan akses kamera di browser, lalu coba lagi.");
      return false;
    }
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return Promise.resolve(null);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8));
  }, []);

  return { videoRef, canvasRef, isCameraActive, cameraError, startCamera, stopCamera, captureFrame };
};
