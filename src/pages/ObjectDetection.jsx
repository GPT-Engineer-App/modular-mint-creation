import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { useLocation } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ObjectDetection = () => {
  const [isWebcamStarted, setIsWebcamStarted] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [detectionInterval, setDetectionInterval] = useState();
  const [objectCounts, setObjectCounts] = useState({});
  const [historicalData, setHistoricalData] = useState([]);
  const [trackedObjects, setTrackedObjects] = useState({});
  const location = useLocation();
  const videoRef = useRef(null);
  const modelRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const savedCounts = JSON.parse(sessionStorage.getItem('objectCounts')) || {};
    setObjectCounts(savedCounts);
    const savedHistoricalData = JSON.parse(localStorage.getItem('historicalData')) || [];
    setHistoricalData(savedHistoricalData);
  }, []);

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
        };
        videoRef.current.onloadeddata = () => {
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
        };
      }
    } catch (error) {
      setIsWebcamStarted(false)
      console.error('Error accessing webcam:', error);
    }
  };

  const stopWebcam = useCallback(() => {
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
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
    }
  }, [detectionInterval]);

  const resetCounts = useCallback(() => {
    setObjectCounts({});
    setHistoricalData([]);
    sessionStorage.removeItem('objectCounts');
    localStorage.removeItem('historicalData');
  }, []);

  const predictObject = async () => {
    if (!modelRef.current || !videoRef.current || !canvasRef.current) return;

    try {
      const video = videoRef.current;
      if (video.readyState !== 4 || video.videoWidth === 0 || video.videoHeight === 0) {
        console.log('Video not ready yet');
        return;
      }

      const ctx = canvasRef.current.getContext('2d');
      
      // Ensure canvas dimensions match video dimensions
      if (canvasRef.current.width !== video.videoWidth || canvasRef.current.height !== video.videoHeight) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
      }
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);

      const predictions = await modelRef.current.detect(ctx.canvas);
      setPredictions(predictions);

      const newTrackedObjects = { ...trackedObjects };
      const counts = {};

      predictions.forEach(prediction => {
        const { class: objectClass, bbox, score } = prediction;
        const [x, y, width, height] = bbox;
        const objectId = `${objectClass}_${Math.round(x)}_${Math.round(y)}`;

        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = '#00FFFF';
        ctx.font = '18px Arial';
        ctx.fillText(`${objectClass} - ${Math.round(score * 100)}%`, x, y > 10 ? y - 5 : 10);

        if (!newTrackedObjects[objectId]) {
          newTrackedObjects[objectId] = { class: objectClass, lastSeen: Date.now() };
          counts[objectClass] = (counts[objectClass] || 0) + 1;
        }
      });

      // Remove objects that haven't been seen for more than 5 seconds
      const now = Date.now();
      Object.keys(newTrackedObjects).forEach(id => {
        if (now - newTrackedObjects[id].lastSeen > 5000) {
          delete newTrackedObjects[id];
        }
      });

      setTrackedObjects(newTrackedObjects);

      setObjectCounts(prevCounts => {
        const newCounts = { ...prevCounts };
        Object.entries(counts).forEach(([key, value]) => {
          newCounts[key] = (newCounts[key] || 0) + value;
        });
        sessionStorage.setItem('objectCounts', JSON.stringify(newCounts));
        return newCounts;
      });

      // Update historical data every minute
      const nowDate = new Date();
      if (nowDate.getSeconds() === 0) {
        setHistoricalData(prevData => {
          const newData = [...prevData, { timestamp: nowDate.toISOString(), ...counts }];
          localStorage.setItem('historicalData', JSON.stringify(newData.slice(-60))); // Keep last 60 data points
          return newData.slice(-60);
        });
      }
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
              <Button onClick={resetCounts}>
                Reset Counts
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Object Counts</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(objectCounts).length > 0 ? (
            <ul>
              {Object.entries(objectCounts).map(([objectClass, count]) => (
                <li key={objectClass}>
                  {`${objectClass}: ${count}`}
                </li>
              ))}
            </ul>
          ) : (
            <Alert>
              <AlertDescription>No objects detected yet.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Historical Data</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(objectCounts).map((objectClass, index) => (
                <Line 
                  key={objectClass}
                  type="monotone"
                  dataKey={objectClass}
                  stroke={`hsl(${index * 30}, 70%, 50%)`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ObjectDetection;
