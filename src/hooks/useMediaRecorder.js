import { useState, useRef } from 'react';

function useUserMedia(constraints) {
  const [stream, setStream] = useState();
  async function getStream(refresh = false) {
    if (stream && !refresh) {
      return stream;
    }
    const _stream = await navigator.mediaDevices.getUserMedia(constraints);
    setStream(_stream);
    return _stream;
  }
  return { stream, getStream };
}

export function useMediaRecorder({ constraints, onStop }) {
  const [recorder, setRecorder] = useState();
  const { getStream } = useUserMedia(constraints);
  const chunks = useRef([]);

  async function start() {
    const stream = await getStream(constraints, true);
    chunks.current = [];
    const _recorder = new MediaRecorder(stream);
    _recorder.start();
    setRecorder(_recorder);
    _recorder.addEventListener('dataavailable', (event) => {
      chunks.current.push(event.data);
    });
    _recorder.addEventListener('stop', () => {
      onStop && onStop(chunks.current);
    });
  }

  async function stop() {
    if (recorder) {
      recorder.stop();
      (await getStream()).getTracks().forEach((track) => track.stop());
    }
  }

  return [start, stop];
}
