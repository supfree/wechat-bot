import axios from 'axios'
import crypto from 'crypto'
import fs from 'fs'
import { clearMemory,FASTGPT_API_URL,FASTGPT_API_KEY } from '../../config.js'

function md5Hash(input) {
    const hash = crypto.createHash('md5');
    hash.update(input);
    const hex = hash.digest('hex');
    return hex;
}

export async function getFastGptReplay(prompt, name) {
    const oname = md5Hash(name);
    const path = `cache/fastgpt/${oname}.txt`;

    // 删除记忆
    if (prompt.includes(clearMemory)) {
        fs.unlinkSync(path);
        return '我的记忆已清除';
    }

    let chatId = '';
    if (fs.existsSync(path)) {
        chatId = fs.readFileSync(path, 'utf8');
    } else {
        chatId = Date.now().toString();
        fs.writeFileSync(path, chatId);
    }

    const data = {
        chatId: chatId,
        messages: [{role: 'user', content: prompt}],
        model: 'gpt-3.5-turbo',
        temperature: 0.9,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    }

    try {
        const res = await axios.post(FASTGPT_API_URL + '/chat/completions', data, {
            timeout: 100000,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FASTGPT_API_KEY}`
            },
        })
        const { choices } = res.data;
        const result = choices[0].message.content;

        return result;
    } catch (error) {
        console.error(error.code);
        console.error(error.message);
        fs.unlinkSync(path);
    }
}


