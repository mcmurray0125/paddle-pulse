import { createContext, useState, useContext, useEffect, useRef } from 'react';
import * as Pitchfinder from 'pitchfinder';

export const AudioContext = createContext();

const AudioContextProvider = ({ children }) => {
  const [count, setCount] = useState(0);
  const streamRef = useRef(null);
  const contextRef = useRef(null);

  const setupAudioContext = async () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const stream = await new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(resolve)
          .catch(reject);
      });
      const source = context.createMediaStreamSource(stream);

      streamRef.current = stream;
      contextRef.current = context;

      const processor = context.createScriptProcessor(1024, 1, 1);
      
      source.connect(processor);
      processor.connect(context.destination);
      processor.onaudioprocess = handleAudioProcess;

    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopAudioContext = () => {
    const stream = streamRef.current;
    const context = contextRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (context && context.state !== 'closed') {
      context.close();
      contextRef.current = null;
    }
  };

  
  const handleAudioProcess = (event) => {    
    const context = contextRef.current;
    
    if (!context) {
      console.log('Audio context not fully initialized yet.');
      return;
    }

    const audioData = event.inputBuffer.getChannelData(0);
  
    const sampleRate = context.sampleRate;
  
    const frequency = estimatePitch(audioData, sampleRate);
    const db = calculateDb(audioData);
  
    console.log(frequency);

  };

  const preprocessAudio = (audioData) => {
    // Apply your desired preprocessing to the audio data
    return audioData;
  };

  const estimatePitch = (audioData, sampleRate) => {
    const pitchOptions = {
      // Choose the pitch detection algorithm and its configuration
      sampleRate: sampleRate,
    };

    const pitchDetector = new Pitchfinder.YIN(pitchOptions);

    // Preprocess the audio data if necessary
    const preprocessedData = preprocessAudio(audioData);

    // Estimate the pitch
    const frequency = pitchDetector(preprocessedData);

    return frequency; // If no pitch is detected, return 0
  };

  const calculateDb = (audioData) => {
    // Calculate the decibel level of the audio data
    const rms = Math.sqrt(audioData.reduce((sum, x) => sum + x * x, 0) / audioData.length);
    const db = 20 * Math.log10(rms);

    return db || 'No DB'; // If no audio data, return -Infinity
  };


  return (
    <AudioContext.Provider value={{ count, setCount, streamRef, contextRef, setupAudioContext, stopAudioContext }}>
      {children}
    </AudioContext.Provider>
  );
};

const useAudioContext = () => {
  return useContext(AudioContext);
};

export { AudioContextProvider, useAudioContext };