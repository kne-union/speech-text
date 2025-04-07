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