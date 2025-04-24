const fs = require('fs-extra');
const path = require('path');

(async () => {
  const src = path.join(__dirname, '../src/xfyun-dist');
  const dest = path.join(__dirname, '../xfyun-dist');
  await fs.copy(src, dest);
  await fs.copy(src, path.join(__dirname, '../example/public/xfyun-dist'));
})();
