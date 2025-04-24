const { realtimeXfyun } = _SpeechText;
const { Button, Alert, Flex } = antd;
const { default: axios } = _axios;
const { useState, useEffect, useRef } = React;
const CryptoJS = cryptoJS;

const BaseExample = () => {
  const [message, setMessage] = useState({ type: 'info', message: '尚未开始' });
  const [recording, setRecording] = useState(false);
  const recordRef = useRef(null);
  useEffect(() => {
    recordRef.current = realtimeXfyun({
      workerUrl: './xfyun-dist',
      getToken: async () => {
        const appId = '6a61e4b2';
        const secretKey = '';
        const ts = Math.floor(new Date().getTime() / 1000);
        const signa = CryptoJS.MD5(appId + ts).toString(CryptoJS.enc.Hex);
        const signatureSha = CryptoJS.HmacSHA1(signa, secretKey);
        const signature = CryptoJS.enc.Base64.stringify(signatureSha);
        return { appid: appId, ts, signa: signature };
      },
      onChange: ({ message, messageList }) => {
        console.log(messageList);
        setMessage({ type: 'success', message });
      }
    });
  }, []);

  return (
    <Flex vertical gap={10}>
      <Alert type={message.type} message={message.message} />
      <div>
        <Button
          onClick={() => {
            recordRef.current.then(async ({ start, stop }) => {
              setMessage({ type: 'warning', message: '正在识别，请稍等' });
              if (recording) {
                await stop();
                setMessage({ type: 'info', message: '识别结束' });
              } else {
                setMessage({ type: 'warning', message: '开始语音识别' });
                start({ roleType: 2 });
              }
              setRecording(!recording);
            });
          }}>
          {recording ? '正在录制' : '点击开始'}
        </Button>
      </div>
    </Flex>
  );
};

render(<BaseExample />);
