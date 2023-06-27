import { createContext, useState, useContext, useEffect, useRef } from 'react';
import * as Pitchfinder from 'pitchfinder';

export const AudioContext = createContext();

const AudioContextProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const [context, setContext] = useState(null);
  const [count, setCount] = useState(0);
  const analyzerRef = useRef(null);

  const setupAudioContext = async () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = context.createMediaStreamSource(stream);

      setStream(stream);
      setContext(context);
      analyzerRef.current = context.createScriptProcessor(1024, 1, 1);
      analyzerRef.current.onaudioprocess = handleAudioProcess;

      source.connect(analyzerRef.current);
      analyzerRef.current.connect(context.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopAudioContext = () => {
    if (analyzerRef.current) {
      analyzerRef.current.disconnect();
      analyzerRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (context && context.state !== 'closed') {
      context.close();
      setContext(null);
    }
  };

  const handleAudioProcess = (event) => {
    const audioData = event.inputBuffer.getChannelData(0);
  
    if (!context || !context.sampleRate) {
      console.log('Audio context not fully initialized yet.');
      return;
    }
  
    const sampleRate = context.sampleRate;
  
    const frequency = estimatePitch(audioData, sampleRate);
    const db = calculateDb(audioData);
  
    if (875 <= frequency <= 1000 && db >= thresholdDb) {
      consecutiveHits += 1;
  
      if (consecutiveHits >= consecutiveHitsThreshold && consecutiveMisses >= consecutiveMissesThreshold) {
        consecutiveHits = 0;
        consecutiveMisses = 0;
        console.log('HIT');
      }
    } else {
      consecutiveHits = 0;
      consecutiveMisses += 1;
      console.log('miss');
    }
  };

  const preprocessAudio = (audioData) => {
    // Apply your desired preprocessing to the audio data
    return audioData;
  };

  const estimatePitch = (audioData, sampleRate) => {
    const pitchOptions = {
      // Choose the pitch detection algorithm and its configuration
      sampleRate: sampleRate,
      quantization: 4, // Increase for lower latency, decrease for more accurate pitch
    };

    const pitchDetector = new Pitchfinder.YIN(pitchOptions);

    // Preprocess the audio data if necessary
    const preprocessedData = preprocessAudio(audioData);

    // Estimate the pitch
    const frequency = pitchDetector(preprocessedData);

    return frequency || 0; // If no pitch is detected, return 0
  };

  const calculateDb = (audioData) => {
    // Calculate the decibel level of the audio data
    const rms = Math.sqrt(audioData.reduce((sum, x) => sum + x * x, 0) / audioData.length);
    const db = 20 * Math.log10(rms);

    return db || 'No DB'; // If no audio data, return -Infinity
  };

  const thresholdDb = -30;
  const consecutiveHitsThreshold = 2;
  const consecutiveMissesThreshold = 10;
  let consecutiveHits = 0;
  let consecutiveMisses = 0;


  return (
    <AudioContext.Provider value={{ count, setCount, stream, context, setupAudioContext, stopAudioContext }}>
      {children}
    </AudioContext.Provider>
  );
};

const useAudioContext = () => {
  return useContext(AudioContext);
};

export { AudioContextProvider, useAudioContext };