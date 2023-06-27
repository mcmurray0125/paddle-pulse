import * as Pitchfinder from 'pitchfinder';

class AudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs) {
      const audioData = inputs[0][0];
      const sampleRate = this.port.sampleRate;
  
      const frequency = this.estimatePitch(audioData, sampleRate);
      const db = this.calculateDb(audioData);
  
      this.port.postMessage({ frequency, db });
  
      return true;
    }
  
    preprocessAudio(audioData) {
      // Apply your desired preprocessing to the audio data
      return audioData;
    }
  
    estimatePitch(audioData, sampleRate) {
      const pitchOptions = {
        // Choose the pitch detection algorithm and its configuration
        sampleRate: sampleRate,
      };
  
      const pitchDetector = new Pitchfinder.YIN(pitchOptions);
  
      // Preprocess the audio data if necessary
      const preprocessedData = this.preprocessAudio(audioData);
  
      // Estimate the pitch
      const frequency = pitchDetector(preprocessedData);
  
      return frequency; // If no pitch is detected, return 0
    }
  
    calculateDb(audioData) {
      // Calculate the decibel level of the audio data
      const rms = Math.sqrt(audioData.reduce((sum, x) => sum + x * x, 0) / audioData.length);
      const db = 20 * Math.log10(rms);
  
      return db || 'No DB'; // If no audio data, return -Infinity
    }
  }
  
  registerProcessor('audio-processor', AudioProcessor);
  