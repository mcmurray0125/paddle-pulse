import axios from 'axios';

const setupAudioContext = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);

    const processor = context.createScriptProcessor(1024, 1, 1);
    processor.onaudioprocess = handleAudioProcess;

    source.connect(processor);
    processor.connect(context.destination);

    return { stream, context };
  } catch (error) {
    console.error('Error accessing microphone:', error);
    return null;
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
      console.log(decodedData);
    });
  } catch (error) {
    console.error('Error sending audio data:', error);
  }
};

export default setupAudioContext;
