import numpy as np
from scipy import signal
import eventlet
from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='http://localhost:5173')

print('Server listening on port 5001...')

def preprocess_audio(audio_data):
    # Apply a moving average filter to reduce noise
    window_size = 7
    filtered_data = signal.convolve(audio_data, np.ones(window_size) / window_size, mode='same')

    return filtered_data

def estimate_pitch(audio_data, sample_rate):
    preprocessed_data = preprocess_audio(audio_data)

    # Normalize the preprocessed audio data
    preprocessed_data = preprocessed_data / np.max(np.abs(preprocessed_data))

    # Compute the autocorrelation of the audio signal
    autocorr = np.correlate(preprocessed_data, preprocessed_data, mode='full')

    # Keep only the positive part of the autocorrelation
    autocorr = autocorr[len(autocorr)//2:]

    # Find the first peak in the autocorrelation (excluding the first sample)
    peak_index = signal.argrelmax(autocorr, order=1)[0][0]

    # Convert the peak index to a frequency (in Hz)
    frequency = sample_rate / peak_index

    return frequency

threshold_db = -30  # Adjust the threshold level as per your requirements

def calculate_db(audio_data):
    rms = np.sqrt(np.mean(np.square(audio_data)))
    db = 20 * np.log10(rms)
    return db

consecutive_hits_threshold = 2  # Adjust the threshold for consecutive hits as per your requirements
consecutive_misses_threshold = 10  # Adjust the threshold for consecutive misses as per your requirements

consecutive_hits = 0
consecutive_misses = 0

@socketio.on('connect')
def connect():
    print('Client connected.')

@socketio.on('audioData')
def audio_data(data):
    global consecutive_hits, consecutive_misses
    audio_data = np.frombuffer(data['data'], dtype=np.float32)
    sample_rate = 44100

    frequency = estimate_pitch(audio_data, sample_rate)

    if 875 <= frequency <= 1000 and calculate_db(audio_data) >= threshold_db:
        consecutive_hits += 1

        if consecutive_hits >= consecutive_hits_threshold and consecutive_misses >= consecutive_misses_threshold:
            consecutive_hits = 0
            consecutive_misses = 0
            socketio.emit('message', 'HIT')
        # else:
        #     socketio.emit('message', 'miss')
    else:
        consecutive_hits = 0
        consecutive_misses += 1
        # socketio.emit('message', 'miss')

    # use miss messages to fine tune audio analysis.

@socketio.on('disconnect')
def disconnect():
    global consecutive_hits, consecutive_misses
    print('Client disconnected.')

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 5001)), app)
