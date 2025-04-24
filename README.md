
# speech-text


### 描述

对接阿里和讯飞语音转文字


### 安装

```shell
npm i --save @kne/speech-text
```

### 示例(全屏)


#### 示例样式

```scss
.ant-card {
  border-color: black;
  text-align: center;
  width: 200px;
}
```

#### 示例代码

- 录音文件上传识别
- 录音文件上传识别
- _SpeechText(@kne/current-lib_speech-text)[import * as _SpeechText from "@kne-components/speech-text"],antd(antd)

```jsx
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
```

- 实时语音识别
- 实时语音识别
- _SpeechText(@kne/current-lib_speech-text)[import * as _SpeechText from "@kne-components/speech-text"],antd(antd),_axios(axios)

```jsx
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
```

- 讯飞实时语音识别
- 讯飞实时语音识别
- _SpeechText(@kne/current-lib_speech-text)[import * as _SpeechText from "@kne-components/speech-text"],antd(antd),_axios(axios),cryptoJS(crypto-js)

```jsx
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

```


### API

#### 默认导出 speech(options):Promise

上传语音文件识别

example:

```javascript
const { start, stop } = await speech(options);
```

#### options:Object

| 属性名 | 说明             | 类型     | 默认值 |
|-----|----------------|--------|-----|
| url | 上传文件语音识别目标接口地址 | string | -   |

#### 开始录音 start():Promise

example:

```javascript
await start();
```

#### 结束录音 stop():Promise

example:

```javascript
const response = await stop();
const { code, message } = response.data;
```

| 属性名     | 说明               | 类型     | 默认值 |
|---------|------------------|--------|-----|
| code    | 后端接口返回状态值,200为成功 | number | -   |
| message | 语音转换结果           | string | -   |

### speechTextRealTime(options):Promise

实时语音识别

example:

```javascript
const { start, stop } = await speechTextRealTime(options);
```

#### options:Object

| 属性名           | 说明                                                         | 类型                           | 默认值                                    |
|---------------|------------------------------------------------------------|------------------------------|----------------------------------------|
| getToken      | 获取Token方法:getToken():{token,appKey}                        | function                     | -                                      |
| onChange      | 识别文本内容发生变化时回调函数                                            | function                     | ({message}) => {console.log(message);} |
| onError       | 错误处理                                                       | function(message,type,error) | -                                      |
| getGatewayUrl | 获取WebSocket的url地址: getGatewayUrl({token}):url,可以获取到token参数 | function                     | -                                      |
| onComplete    | 录音结束回调方法                                                   | function                     | -                                      |
| url           | 保存录音文件url                                                  | string                       | -                                      |

#### 开始录音 start():Promise

example:

```javascript
await start({
  getToken: () => {
  },
  onChange: ({ message }) => {
  },
  onComplete: ({ file, taskId, messageId, message, chunks }) => {
  }
});
```

#### 结束录音 stop():Promise

example:

```javascript
await stop();
```
