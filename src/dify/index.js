import axios from 'axios'
import crypto from 'crypto'
import fs from 'fs'
import { clearMemory,DIFY_API_URL,DIFY_API_KEY } from '../../config.js'


function md5Hash(input) {
    const hash = crypto.createHash('md5');
    hash.update(input);
    const hex = hash.digest('hex');
    return hex;
}

export async function getDifyReplay(prompt, name) {
    const oname = md5Hash(name);
    const path = `cache/dify/${oname}.txt`;

    // 删除记忆
    if(prompt.includes(clearMemory)){
        fs.unlinkSync(path); 
        return '我的记忆已清除';
    }

    let conversation_id;
    if (fs.existsSync(path)) {
        conversation_id = fs.readFileSync(path, 'utf8');
    }

    const data = {
        "inputs": {},
        "query": prompt,
        "response_mode": "blocking",
        "conversation_id": conversation_id || "",
        "user": 'abc-123'
    }

    try {
        const res = await axios.post(DIFY_API_URL + '/chat-messages', data, {
            timeout: 200000,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DIFY_API_KEY}`
            },
        })

        fs.writeFileSync(path, res.data.conversation_id);
        return res.data.answer;
    } catch (error) {
        console.error(error.code);
        console.error(error.message);
    }
}


