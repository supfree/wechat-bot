import { getGptReply } from '../openai/index.js'
import { getKimiReply } from '../kimi/index.js'
import { getXunfeiReply } from '../xunfei/index.js'
import { getFastGptReplay } from '../fastgtp/index.js'
import { getDifyReplay } from '../dify/index.js'


/**
 * 获取ai服务
 * @param serviceType 服务类型 'GPT' | 'Kimi'
 * @returns {Promise<void>}
 */
export function getServe(serviceType) {
  switch (serviceType) {
    case 'ChatGPT':
      return getGptReply
    case 'Kimi':
      return getKimiReply
    case 'Xunfei':
      return getXunfeiReply
    case 'Dify':
      return getDifyReplay
    case 'FastGpt':
      return getFastGptReplay
    default:
      return getGptReply
  }
}