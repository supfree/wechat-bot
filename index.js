import "./src/wechaty/index.js";
import fs from 'fs';
import path from 'path';

function emptyDir(dirPath) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const curPath = path.join(dirPath, file);
        fs.unlinkSync(curPath);
    });
}

emptyDir('cache/dify');
emptyDir('cache/fastgpt');

