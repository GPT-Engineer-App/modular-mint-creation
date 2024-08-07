import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const ObjectDetection = () => {
  const [isWebcamStarted, setIsWebcamStarted] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [detectionInterval, setDetectionInterval] = useState();
  const videoRef = useRef(null);
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
      }
    } catch (error) {
      setIsWebcamStarted(false)
      console.error('Error accessing webcam:', error);
    }
  };

  const stopWebcam = () => {
    const video = videoRef.current;

    if (video) {
      const stream = video.srcObject;
      const tracks = stream.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });

      video.srcObject = null;
      setPredictions([])
      setIsWebcamStarted(false)
    }
  };

  const predictObject = async () => {
    if (!modelRef.current || !videoRef.current) return;

    try {
      const predictions = await modelRef.current.detect(videoRef.current);
      setPredictions(predictions);
    } catch (err) {
      console.error(err)
    }
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
                autoPlay
                muted
              />
              {predictions.map((prediction, index) => (
                <React.Fragment key={index}>
                  <p
                    className="absolute bg-orange-500 bg-opacity-85 text-white border border-dashed border-white z-10 text-xs m-0 p-1"
                    style={{
                      left: `${prediction.bbox[0]}px`,
                      top: `${prediction.bbox[1]}px`,
                      width: `${prediction.bbox[2] - 100}px`
                    }}
                  >
                    {`${prediction.class} - ${Math.round(prediction.score * 100)}% confidence`}
                  </p>
                  <div
                    className="absolute bg-green-500 bg-opacity-25 border border-dashed border-white z-0"
                    style={{
                      left: `${prediction.bbox[0]}px`,
                      top: `${prediction.bbox[1]}px`,
                      width: `${prediction.bbox[2]}px`,
                      height: `${prediction.bbox[3]}px`
                    }}
                  />
                </React.Fragment>
              ))}
            </div>
            <div className="flex space-x-4">
              <Button onClick={isWebcamStarted ? stopWebcam : startWebcam}>
                {isWebcamStarted ? "Stop" : "Start"} Webcam
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {predictions.map((prediction, index) => (
                <li key={index}>
                  {`${prediction.class} (${(prediction.score * 100).toFixed(2)}%)`}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ObjectDetection;
