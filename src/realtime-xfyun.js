import RecorderManager from './xfyun-dist/index.esm';

const realtime = async options => {
  const {
    url,
    workerUrl,
    options: requestOptions,
    getToken,
    getGatewayUrl,
    onError,
    onChange,
    onProgress,
    onComplete,
    sampleRate,
    frameSize
  } = Object.assign(
    {},
    {
      getGatewayUrl: params => {
        const urlSearchParams = new URLSearchParams(params);
        return `wss://rtasr.xfyun.cn/v1/ws?${urlSearchParams.toString()}`;
      },
      onChange: ({ message }) => {
        console.log(message);
      },
      onProgress: () => {},
      onError: () => {},
      sampleRate: 16000,
      frameSize: 1280
    },
    options
  );

  let context = null;
  return {
    start: async options => {
      const recorder = new RecorderManager(workerUrl);
      const recorderPromise = new Promise(resolve => {
        recorder.onStart = () => {
          resolve();
        };
      });
      const params = Object.assign({}, options, await getToken());
      const url = getGatewayUrl(params);
      const ws = new WebSocket(url);
      let resultText = '',
        resultArray = [],
        type = '0';
      ws.onopen = e => {
        // 开始录音
        recorder.start({
          sampleRate,
          frameSize
        });
      };
      ws.onerror = e => {
        console.error(e);
        recorder.stop();
        onError('连接服务器失败', 'WS_SERVER_ERROR', e);
      };
      ws.onclose = () => {
        recorder.stop();
      };
      ws.onmessage = e => {
        let jsonData = JSON.parse(e.data);

        console.log(jsonData);
        if (jsonData.action === 'error') {
          console.log(jsonData);
          onError(jsonData.desc, 'XFYUN_SERVER_ERROR', jsonData);
        }

        if (jsonData.action !== 'result') {
          return;
        }
        const data = JSON.parse(jsonData.data);
        let resultTextTemp = '';
        data.cn.st.rt.forEach(j => {
          j.ws.forEach(k => {
            k.cw.forEach(l => {
              if (l.rl !== '0') {
                type = l.rl;
              }
              resultTextTemp += l.w;
            });
          });
        });
        if (data.cn.st.type === '0') {
          const time = new Date();
          // 【最终】识别结果：
          resultText += resultTextTemp;
          if (type !== '0') {
            if (!Array.isArray(resultArray[type - 1])) {
              resultArray[type - 1] = [];
            }
            resultArray[type - 1].push({
              type,
              message: resultTextTemp,
              time
            });
          }
          onProgress && onProgress({ type, message: resultTextTemp, time });
          resultTextTemp = '';
        }
        onChange && onChange({ message: resultText, messageList: resultArray, temp: resultTextTemp, type });
      };

      recorder.onFrameRecorded = ({ isLastFrame, frameBuffer }) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(new Int8Array(frameBuffer));
          if (isLastFrame) {
            ws.send('{"end": true}');
          }
        }
      };

      recorder.onStop = audioBuffers => {
        onComplete && onComplete({ audioBuffers });
      };
      context = { ws, recorder, params };
      await recorderPromise;
      return context;
    },
    stop: async () => {
      if (!context) {
        return;
      }
      const { recorder } = context;
      recorder.stop();
    }
  };
};

export default realtime;
