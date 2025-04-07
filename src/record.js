import axios from 'axios';
import Recorder from 'recorder-core';
import 'recorder-core/recorder.wav.min';

const record = async options => {
  const {
    url,
    sampleRate,
    bitRate,
    options: requestOptions,
    onComplete
  } = Object.assign(
    {
      sampleRate: 16000,
      bitRate: 16
    },
    {},
    options
  );
  const rec = Recorder({
    type: 'wav',
    sampleRate,
    bitRate
  });
  return {
    start: async () => {
      await new Promise((resolve, reject) => {
        rec.open(resolve, reject);
      });
      rec.start();
      return { record: rec };
    },
    stop: async () => {
      const file = await new Promise((resolve, reject) => {
        rec.stop(blob => {
          resolve(new File([blob], 'audio.wav', { type: 'audio/wav' }));
        }, reject);
      });
      rec.close();
      onComplete && onComplete({ file });
      return url && (await axios.postForm(url, { file }, requestOptions));
    }
  };
};

export default record;
