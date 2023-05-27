import { createContext, useState, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const AudioContext = createContext();

const AudioContextProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const [context, setContext] = useState(null);
  const [count, setCount] = useState(0);
  const socketRef = useRef(null);

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
      initializeSocket();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const initializeSocket = () => {
    const socket = io('http://localhost:5001'); // Replace with your server address and port

    socket.on('connect', () => {
      console.log(`Connected to Socket`);
    });

    socket.on('message', (data) => {
      const decodedData = data;

      if (decodedData === 'HIT') {
        setCount((prevCount) => prevCount + 1);
      }

      console.log(data);
    });

    socket.on('disconnect', () => {
      console.log(`Disconnected from Socket`);
    });

    socketRef.current = socket;
  };

  const handleAudioProcess = (event) => {
    const audioData = event.inputBuffer.getChannelData(0);

    sendDataToServer(audioData);
  };

  const sendDataToServer = (data) => {
    const socket = socketRef.current;

    if (socket && socket.connected) {
      const float32Array = new Float32Array(data); // Convert audio data to Float32Array
      const length = float32Array.length; // Get the length of the audio data

      socket.emit('audioData', { length, data: float32Array });
    }
  };

  const stopAudioContext = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (context && context.state !== 'closed') {
      context.close();
      setContext(null);
    }
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };


  useEffect(() => {
    return () => {
      stopAudioContext();
    };
  }, []);

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
