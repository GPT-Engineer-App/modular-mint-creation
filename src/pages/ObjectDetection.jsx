import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useLocation } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CameraIcon, LockIcon, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from 'lucide-react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { useDropzone } from 'react-dropzone';
import * as YOLO from 'yolo-js';

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
  const [customClass, setCustomClass] = useState('');
  const [availableClasses, setAvailableClasses] = useState(['plastic bottles', 'aluminium cans', 'cardboard', 'milk cartons']);
  const [settings, setSettings] = useState({
    alertThreshold: 1,
    detectionSensitivity: 0.2,
    alertThresholdEnabled: true,
    detectionSensitivityEnabled: true,
  });
  const [model, setModel] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const location = useLocation();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await YOLO.load('/path/to/your/yolov8.onnx');
        setModel(loadedModel);
        console.log('YOLO model loaded successfully');
      } catch (error) {
        console.error('Error loading YOLO model:', error);
      }
    };

    loadModel();

    return () => {
      if (model) {
        model.dispose();
      }
    };
  }, []);

  const runInference = async (imageData) => {
    if (!model) return;

    try {
      const predictions = await model.detect(imageData);
      setPredictions(predictions);
    } catch (error) {
      console.error('Inference error:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      // Run inference on the uploaded image
      runInference(e.target.result);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

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

  const startWebcam = () => {
    setIsWebcamStarted(true);
  };

  const stopWebcam = useCallback(() => {
    setIsWebcamStarted(false);
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
    }
  }, [detectionInterval]);

  const switchCamera = () => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  };

  const captureImage = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    // Convert base64 to array buffer
    const base64 = imageSrc.split(',')[1];
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    runInference(bytes.buffer);
  }, [webcamRef]);

  useEffect(() => {
    if (isWebcamStarted) {
      setDetectionInterval(setInterval(captureImage, 500));
    } else {
      if (detectionInterval) {
        clearInterval(detectionInterval);
        setDetectionInterval(null);
      }
    }
  }, [isWebcamStarted, captureImage]);

  const resetCounts = useCallback(() => {
    setObjectCounts({});
    setHistoricalData([]);
    sessionStorage.removeItem('objectCounts');
    localStorage.removeItem('historicalData');
  }, []);

  const predictObject = async () => {
    if (!model || !webcamRef.current || !canvasRef.current) return;

    try {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Ensure canvas dimensions match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear the canvas and draw the video frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw the counting line
      const linePos = canvas.width * (linePosition / 100);
      ctx.beginPath();
      ctx.moveTo(linePos, 0);
      ctx.lineTo(linePos, canvas.height);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Perform object detection
      const predictions = await model.detect(canvas);
      const filteredPredictions = settings.detectionSensitivityEnabled
        ? predictions.filter(pred => pred.score >= settings.detectionSensitivity)
        : predictions;

      // Process predictions and update tracking
      const newTrackedObjects = {};
      const counts = {};

      filteredPredictions.forEach(prediction => {
        const { class: objectClass, bbox, score } = prediction;
        const [x, y, width, height] = bbox;
        const objectId = `${objectClass}_${Math.round(x)}_${Math.round(y)}`;
        const objectCenter = x + width / 2;

        // Draw bounding box and label
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = '#00FFFF';
        ctx.font = '14px Arial';
        ctx.fillText(`${objectClass} - ${Math.round(score * 100)}%`, x, y > 10 ? y - 5 : 10);

        // Update tracking
        if (trackedObjects[objectId]) {
          const prevCenter = trackedObjects[objectId].center;
          if ((prevCenter <= linePos && objectCenter > linePos) || (prevCenter >= linePos && objectCenter < linePos)) {
            counts[objectClass] = (counts[objectClass] || 0) + 1;
          }
        }

        newTrackedObjects[objectId] = { 
          class: objectClass, 
          center: objectCenter, 
          lastSeen: Date.now(),
          bbox: [x, y, width, height]
        };
      });

      // Update tracked objects and counts
      setTrackedObjects(newTrackedObjects);
      updateObjectCounts(counts);

      // Update historical data
      updateHistoricalData(counts);

      // Check alert threshold
      checkAlertThreshold(counts);

    } catch (err) {
      console.error('Prediction error:', err);
    }
  };

  const updateObjectCounts = (counts) => {
    setObjectCounts(prevCounts => {
      const newCounts = { ...prevCounts };
      Object.entries(counts).forEach(([key, value]) => {
        newCounts[key] = (newCounts[key] || 0) + value;
      });
      sessionStorage.setItem('objectCounts', JSON.stringify(newCounts));
      return newCounts;
    });
  };

  const updateHistoricalData = (counts) => {
    const now = new Date();
    if (now.getSeconds() === 0) {
      setHistoricalData(prevData => {
        const newData = [...prevData, { timestamp: now.toISOString(), ...counts }];
        const updatedData = newData.slice(-60); // Keep last 60 data points
        localStorage.setItem('historicalData', JSON.stringify(updatedData));
        return updatedData;
      });
    }
  };

  const checkAlertThreshold = (counts) => {
    if (settings.alertThresholdEnabled) {
      const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
      if (totalCount >= settings.alertThreshold) {
        console.log(`Alert: Threshold of ${settings.alertThreshold} objects crossed!`);
        // Implement additional alert logic here (e.g., show a notification)
      }
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
              {isWebcamStarted ? (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: facingMode
                  }}
                  className="w-full h-full"
                />
              ) : (
                <div {...getRootProps()} className="w-full h-64 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop an image here, or click to select a file</p>
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
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
              <Button onClick={() => document.querySelector('input[type="file"]').click()}>
                <Upload className="mr-2 h-4 w-4" /> Upload Image
              </Button>
            </div>
            <div className="w-full max-w-2xl">
              <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Classes to Count
              </label>
              <div className="flex space-x-2">
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
                    {availableClasses.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Add custom class"
                    value={customClass}
                    onChange={(e) => setCustomClass(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      if (customClass && !availableClasses.includes(customClass)) {
                        setAvailableClasses([...availableClasses, customClass]);
                        setSelectedClasses([...selectedClasses, customClass]);
                        setCustomClass('');
                      }
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
