import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { toPng } from 'html-to-image';

const ObjectDetection = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [objectCounts, setObjectCounts] = useState({});
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const modelRef = useRef(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        modelRef.current = await cocoSsd.load();
      } catch (error) {
        console.error('Error loading COCO-SSD model:', error);
      }
    };
    loadModel();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startDetection = async () => {
    if (!modelRef.current) {
      console.error('Model not loaded yet');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setIsDetecting(true);
      detectFrame();
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const stopDetection = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsDetecting(false);
    setObjectCounts({});
    captureCanvas();
  };

  const captureCanvas = () => {
    if (canvasRef.current) {
      toPng(canvasRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'object-detection.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((error) => {
          console.error('Error capturing canvas:', error);
        });
    }
  };

  const detectFrame = async () => {
    if (!isDetecting || !modelRef.current || !videoRef.current || !canvasRef.current) return;

    try {
      const predictions = await modelRef.current.detect(videoRef.current);
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) {
        console.error('Unable to get 2D context from canvas');
        return;
      }
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(videoRef.current, 0, 0, ctx.canvas.width, ctx.canvas.height);

    const counts = {};
    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox;
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = '#00FFFF';
      ctx.fillText(
        `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
        x,
        y > 10 ? y - 5 : 10
      );

      counts[prediction.class] = (counts[prediction.class] || 0) + 1;
    });

    setObjectCounts(counts);
    requestAnimationFrame(detectFrame);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Real-time Object Detection</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Video Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full max-w-2xl"
                style={{ display: 'none' }}
              />
              <canvas
                ref={canvasRef}
                className="w-full max-w-2xl border border-gray-300"
                width="640"
                height="480"
              />
            </div>
            <div className="flex space-x-4">
              <Button onClick={startDetection} disabled={isDetecting}>
                Start Detection
              </Button>
              <Button onClick={stopDetection} disabled={!isDetecting}>
                Stop Detection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Object Counts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {Object.entries(objectCounts).map(([object, count]) => (
              <li key={object}>
                {object}: {count}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ObjectDetection;
