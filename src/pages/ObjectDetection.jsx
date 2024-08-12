import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { useLocation } from 'react-router-dom';

const ObjectDetection = () => {
  const [isWebcamStarted, setIsWebcamStarted] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [detectionInterval, setDetectionInterval] = useState();
  const [objectCounts, setObjectCounts] = useState({});
  const location = useLocation();
  const videoRef = useRef(null);
  const modelRef = useRef(null);
  const canvasRef = useRef(null);

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
      stopWebcam();
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (location.state?.startDetection) {
      startWebcam();
    } else if (location.state?.stopDetection) {
      stopWebcam();
    }
  }, [location]);

  useEffect(() => {
    if (isWebcamStarted) {
      setDetectionInterval(setInterval(predictObject, 500))
    } else {
      if (detectionInterval) {
        clearInterval(detectionInterval)
        setDetectionInterval(null)
      }
    }
  }, [isWebcamStarted]);

  const startWebcam = async () => {
    try {
      setIsWebcamStarted(true)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
        };
      }
    } catch (error) {
      setIsWebcamStarted(false)
      console.error('Error accessing webcam:', error);
    }
  };

  const stopWebcam = () => {
    const video = videoRef.current;

    if (video && video.srcObject) {
      const stream = video.srcObject;
      const tracks = stream.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });

      video.srcObject = null;
      setPredictions([]);
    }
    setIsWebcamStarted(false);
  };

  const predictObject = async () => {
    if (!modelRef.current || !videoRef.current || !canvasRef.current) return;

    try {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(videoRef.current, 0, 0, ctx.canvas.width, ctx.canvas.height);

      const predictions = await modelRef.current.detect(videoRef.current);
      setPredictions(predictions);

      const counts = {};
      predictions.forEach(prediction => {
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 4;
        ctx.strokeRect(...prediction.bbox);

        ctx.fillStyle = '#00FFFF';
        ctx.font = '18px Arial';
        ctx.fillText(`${prediction.class} - ${Math.round(prediction.score * 100)}%`, prediction.bbox[0], prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10);

        counts[prediction.class] = (counts[prediction.class] || 0) + 1;
      });

      setObjectCounts(counts);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Real-time Object Detection and Counting</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Video Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full"
                autoPlay
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="w-full max-w-2xl"
              />
            </div>
            <div className="flex space-x-4">
              <Button onClick={isWebcamStarted ? stopWebcam : startWebcam}>
                {isWebcamStarted ? "Stop" : "Start"} Webcam
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
            {Object.entries(objectCounts).map(([objectClass, count]) => (
              <li key={objectClass}>
                {`${objectClass}: ${count}`}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ObjectDetection;
