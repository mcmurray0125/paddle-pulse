import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

export const AudioContext = createContext();

const AudioContextProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const [context, setContext] = useState(null);
  const [count, setCount] = useState(0);

  const setupAudioContext = async () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = context.createMediaStreamSource(stream);
  
      const processor = context.createScriptProcessor(1024, 1, 1);
      processor.onaudioprocess = handleAudioProcess;
  
      source.connect(processor);
      processor.connect(context.destination);
  
      setStream(stream);
      setContext(context);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };
  

  const handleAudioProcess = async (event) => {
    const audioData = event.inputBuffer.getChannelData(0);

    sendDataToServer(audioData);
  };

  const sendDataToServer = async (data) => {
    try {
      await axios.post('http://127.0.0.1:5000/pulse', data, {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        responseType: 'arraybuffer',
      }).then((response) => {
        const decoder = new TextDecoder('utf-8');
        const decodedData = decoder.decode(response.data);

        if (decodedData === 'HIT') {
          setCount((prevCount) => prevCount + 1);
        }

        console.log(decodedData);
      });
    } catch (error) {
      console.error('Error sending audio data:', error);
    }
  };

  const stopAudioContext = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (context && context.state !== 'closed') {
      context.close();
      setContext(null);
    }
  };  

  return (
    <AudioContext.Provider value={{ count, stream, context, setupAudioContext, stopAudioContext }}>
      {children}
    </AudioContext.Provider>
  );
};

const useAudioContext = () => {
  return useContext(AudioContext);
};

export { AudioContextProvider, useAudioContext };
