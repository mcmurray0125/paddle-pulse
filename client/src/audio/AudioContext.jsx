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
  
    const preProcessed = preprocessAudio(audioData)
    const frequency = estimatePitch(preProcessed, sampleRate);
    const db = calculateDb(audioData);
  
    console.log(frequency);
  };

  const preprocessAudio = (audioData) => {
    const windowSize = 7;
    const filteredData = [];
  
    for (let i = 0; i < audioData.length; i++) {
      let sum = 0;
  
      for (let j = i - Math.floor(windowSize / 2); j <= i + Math.floor(windowSize / 2); j++) {
        const index = Math.min(Math.max(j, 0), audioData.length - 1);
        sum += audioData[index];
      }
  
      const average = sum / windowSize;
      filteredData.push(average);
    }
  
    return filteredData;
  };
  

  const estimatePitch = (audioData, sampleRate) => {
    const bufferSize = audioData.length;
    const autocorrelation = new Float32Array(bufferSize);

    // Calculate autocorrelation
    for (let i = 0; i < bufferSize; i++) {
      let value = 0;
      for (let j = 0; j < bufferSize - i; j++) {
        value += audioData[j] * audioData[j + i];
      }
      autocorrelation[i] = value;
    }

    // Find the peak in the autocorrelation (excluding the first sample)
    let peakIndex = 1;
    let peakValue = autocorrelation[1];
    for (let i = 2; i < bufferSize; i++) {
      if (autocorrelation[i] > peakValue) {
        peakValue = autocorrelation[i];
        peakIndex = i;
      }
    }

    // Convert the peak index to a frequency (in Hz)
    const frequency = sampleRate / peakIndex;

    return frequency || 0; // If no pitch is detected, return 0
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