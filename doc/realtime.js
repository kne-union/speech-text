const {speechTextRealTime} = _SpeechText;
const {Button, Alert, Flex} = antd;
const {default: axios} = _axios;
const {useState, useEffect, useRef} = React;

const BaseExample = () => {
  const [message, setMessage] = useState({type: 'info', message: '尚未开始'});
  const [recording, setRecording] = useState(false);
  const recordRef = useRef(null);
  useEffect(() => {
    recordRef.current = speechTextRealTime({
      getToken: async () => {
        try {
          const {data} = await axios({
            url: 'https://ct.deeperagi.com/action/papi/ai/vCMA02/createToken',
            method: 'POST',
            data: JSON.stringify({
              "avgtype": "11111"
            }),
            headers: {
              'content-type': 'application/json'
            }
          });
          return {
            token: data.token, appKey: data.appKey
          };
        } catch (e) {
          return {
            "appKey": "TYcsiL5CZb9hd9DR", "token": "e80b7d7f6f054f91a79a14a67cb7f34c"
          };
        }
      }, onChange: ({message}) => {
        setMessage({type: 'success', message});
      }
    });
  }, []);

  return <Flex vertical gap={10}>
    <Alert type={message.type} message={message.message}/>
    <div>
      <Button onClick={() => {
        recordRef.current.then(async ({start, stop}) => {
          setMessage({type: 'warning', message: '正在识别，请稍等'});
          if (recording) {
            await stop();
            setMessage({type: 'info', message: '识别结束'});
          } else {
            setMessage({type: 'warning', message: '开始语音识别'});
            start();
          }
          setRecording(!recording);
        });
      }}>{recording ? '正在录制' : '点击开始'}</Button>
    </div>
  </Flex>;
};

render(<BaseExample/>);