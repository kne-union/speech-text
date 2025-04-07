import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const getUUId = () => {
  return uuidv4().replace(/-/g, '');
};

const realtime = async options => {
  const {
    url,
    options: requestOptions,
    getToken,
    getGatewayUrl,
    sampleRate,
    onError,
    onChange,
    onComplete
  } = Object.assign(
    {},
    {
      getGatewayUrl: ({ token }) => `wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1?token=${token}`,
      onChange: ({ message }) => {
        console.log(message);
      },
      onError: () => {},
      sampleRate: 16000
    },
    options
  );
  const taskId = getUUId();
  let context = null;
  return {
    start: async () => {
      const { token, appKey } = await getToken();
      const messageId = getUUId();
      const ws = new WebSocket(getGatewayUrl({ token }));
      const resultChunks = [];
      const chunks = [];
      let message = '';
      await new Promise(resolve => {
        ws.addEventListener('open', () => {
          console.log('socket链接成功');
          ws.send(
            JSON.stringify({
              header: {
                message_id: messageId,
                task_id: taskId,
                namespace: 'SpeechTranscriber',
                name: 'StartTranscription',
                appkey: appKey
              },
              payload: {
                format: 'pcm',
                sample_rate: 16000,
                max_sentence_silence: 200,
                enable_intermediate_result: true,
                enable_punctuation_prediction: true,
                enable_inverse_text_normalization: true
              }
            })
          );
        });
        ws.addEventListener('message', e => {
          const data = JSON.parse(e.data);
          if (data.header.name === 'TranscriptionStarted') {
            resolve();
          }
          if (data.header.name === 'TranscriptionResultChanged' || data.header.name === 'SentenceEnd') {
            Object.assign(resultChunks, { [data.payload.index]: data.payload.result });
            message = Object.keys(resultChunks)
              .sort((a, b) => a - b)
              .map(index => resultChunks[index])
              .join('');
            onChange &&
              onChange({
                payload: data.payload,
                chunks: resultChunks,
                message
              });
          }
        });
      });
      const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true }).catch(e => {
        console.log('获取麦克风权限失败，请刷新后重试');
        onError('获取麦克风权限失败，请刷新后重试', 'NO_MICROPHONE_PERMISSION', e);
        throw e;
      });
      const recorder = new window.MediaRecorder(stream);
      recorder.start(1000);

      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate
      });
      const audioInput = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
      scriptProcessor.onaudioprocess = function (event) {
        const inputData = event.inputBuffer.getChannelData(0);
        const inputData16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; ++i) {
          inputData16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff; // PCM 16-bit
        }
        ws.send(inputData16.buffer);
      };
      audioInput.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);
      const dataHandler = e => {
        chunks.push(e.data);
      };
      recorder.addEventListener('dataavailable', dataHandler);
      context = {
        ws,
        stream,
        taskId,
        messageId,
        scriptProcessor,
        audioInput,
        audioContext,
        appKey,
        resultChunks,
        chunks,
        message,
        destroy: () => {
          ws.send(
            JSON.stringify({
              header: {
                message_id: messageId,
                task_id: taskId,
                namespace: 'SpeechTranscriber',
                name: 'StopTranscription',
                appkey: appKey
              }
            })
          );
          recorder.removeEventListener('dataavailable', dataHandler);
          ws.close();
          scriptProcessor.disconnect();
          audioInput.disconnect();
          audioContext.close();
          const tracks = (stream.getTracks && stream.getTracks()) || stream.audioTracks || [];
          tracks.forEach(track => {
            track.stop && track.stop();
          });
          stream.stop && stream.stop();
        }
      };
      return context;
    },
    stop: async () => {
      if (!context) {
        return;
      }
      const { taskId, messageId, chunks, destroy, message } = context;
      const file = await new Promise((resolve, reject) => {
        const file = new File(chunks, `${taskId}.wav`, { type: 'audio/wav' });
        onComplete && onComplete({ file, taskId, messageId, message, chunks });
        destroy();
        context = null;
        resolve(file);
      });
      return url && (await axios.postForm(url, { file }, requestOptions));
    }
  };
};

export default realtime;
