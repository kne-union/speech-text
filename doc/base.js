const {default: speech} = _SpeechText;
const {Button, Alert, Flex} = antd;
const {useState, useEffect, useRef} = React;

const BaseExample = () => {
    const [message, setMessage] = useState({type: 'info', message: '尚未开始'});
    const [recording, setRecording] = useState(false);
    const recordRef = useRef(null);
    useEffect(() => {
        recordRef.current = speech({url: 'https://ct.deeperagi.com/action/papi/ai/vCMA01/uploadWavFile'});
    }, []);
    return <Flex vertical gap={10}>
        <Alert type={message.type} message={message.message}/>
        <div>
            <Button onClick={() => {
                recordRef.current.then(async ({start, stop}) => {
                    setMessage({type: 'warning', message: '正在识别，请稍等'});
                    if (recording) {
                        const {data} = await stop();
                        if (data.code === 200) {
                            setMessage({type: 'success', message: data.message || '未识别到语音内容'});
                        } else {
                            setMessage({type: 'error', message: '转换错误'});
                        }
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