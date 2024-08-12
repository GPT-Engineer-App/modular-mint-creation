import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';

const VAD = () => {
  const [isListening, setIsListening] = useState(false);
  const [voiceDetected, setVoiceDetected] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [detectedCommand, setDetectedCommand] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const animationFrameRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      setError(null);
      detectVoiceActivity();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Failed to access microphone. Please check your permissions and try again.');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      cancelAnimationFrame(animationFrameRef.current);
      sourceRef.current.disconnect();
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
  };

  const detectVoiceActivity = () => {
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const detectVoice = () => {
      animationFrameRef.current = requestAnimationFrame(detectVoice);
      analyserRef.current.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const isVoice = average > 30; // Adjust this threshold as needed

      setVoiceDetected(isVoice);
      drawWaveform(dataArray);

      if (isVoice) {
        recognizeCommand();
      }
    };

    detectVoice();
  };

  const recognizeCommand = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    const recognition = recognitionRef.current;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      setDetectedCommand(command);

      if (command.includes('start count') || command.includes('start detecting')) {
        navigate('/object-detection', { state: { startDetection: true } });
      } else if (command.includes('stop count') || command.includes('stop detecting')) {
        navigate('/object-detection', { state: { stopDetection: true } });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'aborted') {
        setError('Speech recognition was aborted. Please try again.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
    };

    recognition.onend = () => {
      console.log('Speech recognition ended. Restarting...');
      if (isListening) {
        recognition.start();
      }
    };
  };

  const drawWaveform = (dataArray) => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, width, height);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = voiceDetected ? 'rgb(0, 255, 0)' : 'rgb(0, 0, 0)';
    canvasCtx.beginPath();

    const sliceWidth = width * 1.0 / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * height / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Voice Activity Detection</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Voice Activity Detector</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <canvas ref={canvasRef} width="600" height="200" className="border border-gray-300"></canvas>
            <div className="flex space-x-4">
              <Button onClick={startListening} disabled={isListening}>
                Start Listening
              </Button>
              <Button onClick={stopListening} disabled={!isListening}>
                Stop Listening
              </Button>
            </div>
            {audioUrl && (
              <audio controls src={audioUrl} className="mt-4">
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>VAD Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant={voiceDetected ? "default" : "destructive"}>
            <AlertDescription>
              {voiceDetected ? "Voice activity detected!" : "No voice activity detected."}
            </AlertDescription>
          </Alert>
          {detectedCommand && (
            <Alert variant="default" className="mt-4">
              <AlertDescription>
                Detected command: {detectedCommand}
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VAD;
