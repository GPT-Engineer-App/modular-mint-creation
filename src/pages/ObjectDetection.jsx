import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { useLocation } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CameraIcon, LockIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://cors-anywhere.herokuapp.com/https://backengine-nqhbcnzf.fly.dev/api',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

const ObjectDetection = () => {
  const [isWebcamStarted, setIsWebcamStarted] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [detectionInterval, setDetectionInterval] = useState();
  const [objectCounts, setObjectCounts] = useState({});
  const [historicalData, setHistoricalData] = useState([]);
  const [trackedObjects, setTrackedObjects] = useState({});
  const [facingMode, setFacingMode] = useState('environment');
  const [linePosition, setLinePosition] = useState(50);
  const [isPortrait, setIsPortrait] = useState(false);
  const [lockedObject, setLockedObject] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState(['plastic bottles', 'aluminium cans', 'cardboard', 'milk cartons']);
  const [settings, setSettings] = useState({
    alertThreshold: 5,
    detectionSensitivity: 0.5,
    alertThresholdEnabled: true,
    detectionSensitivityEnabled: true,
  });
  const location = useLocation();
  const videoRef = useRef(null);
  const modelRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const savedCounts = JSON.parse(sessionStorage.getItem('objectCounts')) || {};
    setObjectCounts(savedCounts);
    const savedHistoricalData = JSON.parse(localStorage.getItem('historicalData')) || [];
    setHistoricalData(savedHistoricalData);

    // Fetch settings
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
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
      const constraints = {
        video: {
          facingMode: facingMode
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
        videoRef.current.onloadeddata = () => {
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            setIsPortrait(videoRef.current.videoHeight > videoRef.current.videoWidth);
          }
        };
      }
    } catch (error) {
      setIsWebcamStarted(false)
      console.error('Error accessing webcam:', error);
    }
  };

  const switchCamera = () => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
    if (isWebcamStarted) {
      stopWebcam();
      setTimeout(() => startWebcam(), 100);
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
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Ensure canvas dimensions match video dimensions
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Clear the canvas and draw the video frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw the counting line
      const linePos = canvas.width * (linePosition / 100);
      ctx.beginPath();
      if (isPortrait) {
        ctx.moveTo(0, linePos);
        ctx.lineTo(canvas.width, linePos);
      } else {
        ctx.moveTo(linePos, 0);
        ctx.lineTo(linePos, canvas.height);
      }
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add text to show line position
      ctx.fillStyle = 'red';
      ctx.font = '14px Arial';
      ctx.fillText(`Line: ${linePosition}%`, 10, 20);

      // Perform object detection only if detection sensitivity is enabled
      let predictions = [];
      if (settings.detectionSensitivityEnabled) {
        predictions = await modelRef.current.detect(canvas);
        predictions = predictions.filter(pred => pred.score >= settings.detectionSensitivity);
      }
      setPredictions(predictions);

      const newTrackedObjects = { ...trackedObjects };
      const counts = {};

      const filteredPredictions = selectedClasses.includes('all')
        ? predictions
        : predictions.filter(prediction => selectedClasses.includes(prediction.class));

      filteredPredictions.forEach(prediction => {
        const { class: objectClass, bbox, score } = prediction;
        const [x, y, width, height] = bbox;
        const objectId = `${objectClass}_${Math.round(x)}_${Math.round(y)}`;
        const objectCenter = isPortrait ? y + height / 2 : x + width / 2;

        const isLocked = lockedObject && lockedObject.id === objectId;
        ctx.strokeStyle = isLocked ? '#FF0000' : '#00FFFF';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = isLocked ? '#FF0000' : '#00FFFF';
        ctx.font = '18px Arial';
        ctx.fillText(`${objectClass} - ${Math.round(score * 100)}%`, x, y > 10 ? y - 5 : 10);

        if (isLocked) {
          ctx.fillStyle = '#FF0000';
          ctx.fillText('🔒', x + width - 20, y + 20);
        }

        if (newTrackedObjects[objectId]) {
          const prevCenter = newTrackedObjects[objectId].center;
          if ((prevCenter <= linePos && objectCenter > linePos) || (prevCenter >= linePos && objectCenter < linePos)) {
            counts[objectClass] = (counts[objectClass] || 0) + 1;
          }
          newTrackedObjects[objectId] = { 
            class: objectClass, 
            center: objectCenter, 
            lastSeen: Date.now(),
            bbox: [x, y, width, height]
          };
        } else {
          newTrackedObjects[objectId] = { 
            class: objectClass, 
            center: objectCenter, 
            lastSeen: Date.now(),
            bbox: [x, y, width, height]
          };
        }
      });

      // Update locked object position if it's still visible
      if (lockedObject) {
        const updatedObject = newTrackedObjects[lockedObject.id];
        if (updatedObject) {
          setLockedObject({
            ...lockedObject,
            bbox: updatedObject.bbox
          });
        } else {
          setLockedObject(null);
        }
      }

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

      // Check if alert threshold is reached
      if (settings.alertThresholdEnabled) {
        const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
        if (totalCount >= settings.alertThreshold) {
          console.log(`Alert: Threshold of ${settings.alertThreshold} objects crossed!`);
          // Here you can implement additional alert logic, like showing a notification
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCanvasClick = (event) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if click is on an object
    for (const [id, obj] of Object.entries(trackedObjects)) {
      const [objX, objY, objWidth, objHeight] = obj.bbox;
      if (x >= objX && x <= objX + objWidth && y >= objY && y <= objY + objHeight) {
        setLockedObject(lockedObject && lockedObject.id === id ? null : { id, ...obj });
        break;
      }
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
            <div className="relative w-full max-w-2xl">
              <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full"
                autoPlay
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                onClick={handleCanvasClick}
              />
            </div>
            <div className="w-full max-w-2xl">
              <label htmlFor="line-position" className="block text-sm font-medium text-gray-700 mb-2">
                Counting Line Position
              </label>
              <Slider
                id="line-position"
                min={0}
                max={100}
                step={1}
                value={[linePosition]}
                onValueChange={(value) => setLinePosition(value[0])}
              />
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={isWebcamStarted ? stopWebcam : startWebcam}>
                {isWebcamStarted ? "Stop" : "Start"} Webcam
              </Button>
              <Button onClick={resetCounts}>
                Reset Counts
              </Button>
              <Button onClick={switchCamera}>
                <CameraIcon className="mr-2 h-4 w-4" /> Switch Camera
              </Button>
            </div>
            <div className="w-full max-w-2xl">
              <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Classes to Count
              </label>
              <Select
                id="class-select"
                value={selectedClasses}
                onValueChange={setSelectedClasses}
                multiple
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plastic bottles">Plastic Bottles</SelectItem>
                  <SelectItem value="aluminium cans">Aluminium Cans</SelectItem>
                  <SelectItem value="cardboard">Cardboard</SelectItem>
                  <SelectItem value="milk cartons">Milk Cartons</SelectItem>
                </SelectContent>
              </Select>
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
