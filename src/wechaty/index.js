import { WechatyBuilder, ScanStatus, log } from 'wechaty'
import inquirer from 'inquirer'
import qrTerminal from 'qrcode-terminal'
import { defaultMessage, shardingMessage } from './sendMessage.js'
import dotenv from 'dotenv'
import fs from 'fs'
import os from 'os'
import crypto from 'crypto'
import moment from 'moment'
import {     SN,  
  OPENAI_API_URL,  
  OPENAI_API_KEY,  
  KIMI_API_KEY,  
  XUNFEI_APP_ID,  
  XUNFEI_API_KEY,  
  XUNFEI_API_SECRET,  
  DIFY_API_URL,  
  DIFY_API_KEY,  
  FASTGPT_API_URL,  
  FASTGPT_API_KEY  , autoAcceptFriend, autoAcceptFriendKeywords, autoFriendshipReply, autoFriendshipReplyContent, autoRoomJoinReply, autoRoomJoinReplyContent } from '../../config.js'

const env = dotenv.config().parsed // 环境参数


// 扫码
function onScan(qrcode, status) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    // 在控制台显示二维码
    qrTerminal.generate(qrcode, { small: true })
    const qrcodeImageUrl = ['https://api.qrserver.com/v1/create-qr-code/?data=', encodeURIComponent(qrcode)].join('')
    console.log('扫码:', qrcodeImageUrl, ScanStatus[status], status)
  } else {
    log.info('扫码: %s(%s)', ScanStatus[status], status)
  }
}

// 登录
function onLogin(user) {
  console.log(`${user} 已经登录`)
  const date = new Date()
  console.log(`当前时间 :${date}`)
  console.log(`微信机器人已激活`)
}

// 登出
function onLogout(user) {
  console.log(`${user} 已经退出登录`)
  process.exit();
}

// 收到好友请求
async function onFriendShip(friendship) {
  if (friendship.type() === 2) {
    if (autoAcceptFriend && (autoAcceptFriendKeywords.some(keyword => friendship.hello().includes(keyword)) || autoAcceptFriendKeywords.length === 0)) {
      await friendship.accept()
      const contact = friendship.contact();
      if (autoFriendshipReply) { //主动打招呼
        await contact.say(autoFriendshipReplyContent)
      }
    }
  }
}

// 有人加入群
async function onRoomJoin(room, inviteeList, inviter) {
  if (!autoRoomJoinReply) {
    return;
  }
  for (const invitee of inviteeList) {
    const name = invitee.name();;
    await room.say(`@${name} ${autoRoomJoinReplyContent}`);
  }

}

//获得机器码
function getMachineCode() {
  const hostname = os.hostname();
  const hash = crypto.createHash('md5').update(hostname).digest('hex').toUpperCase();
  return hash;
}

// 解析激活码中的时间戳  
function parseTimestampFromActivationCode(activationCode) {
  const timestampString = activationCode.slice(-10);
  return parseInt(timestampString, 10); // 将字符串转换为整数  
}

// 验证激活码是否有效（是否在生成后的一年内）  
function validateActivationCode(machineCode, activationCode) {
  try {
    const parsedTimestamp = parseTimestampFromActivationCode(activationCode);
    const currentTimestamp = Math.round(Date.now() / 1000);
    const oneYearLater = moment.unix(parsedTimestamp).add(1, 'year').unix();

    // 检查当前时间是否在激活码生成时间之后且一年内  
    if (currentTimestamp >= parsedTimestamp && currentTimestamp <= oneYearLater) {
      const regeneratedActivationCodeHash = crypto.createHash('sha256').update(`${machineCode}${parsedTimestamp}`).digest('hex');
      const regeneratedActivationCode = `${regeneratedActivationCodeHash}${parsedTimestamp}`;
      return regeneratedActivationCode === activationCode;
    }
    return false;
  } catch (error) {
    console.error('Error validating activation code:', error.message);
    return false;
  }
}

/**
 * 消息发送
 * @param msg
 * @param isSharding
 * @returns {Promise<void>}
 */
async function onMessage(msg) {
  const msg2 = {}
  // 默认消息回复
  await defaultMessage(msg, bot, serviceType)
  // 消息分片
  // await shardingMessage(msg,bot)
}

// 初始化机器人
const validationResult = validateActivationCode(getMachineCode(), SN);
if (validationResult !== true) {
  console.log('激活码错误或已失效');
  process.exit();
}

const CHROME_BIN = process.env.CHROME_BIN ? { endpoint: process.env.CHROME_BIN } : {}
let serviceType = ''
export const bot = WechatyBuilder.build({
  name: 'WechatEveryDay',
  puppet: 'wechaty-puppet-wechat4u', // 如果有token，记得更换对应的puppet
  // puppet: 'wechaty-puppet-wechat', // 如果 wechaty-puppet-wechat 存在问题，也可以尝试使用上面的 wechaty-puppet-wechat4u ，记得安装 wechaty-puppet-wechat4u
  puppetOptions: {
    uos: true,
    ...CHROME_BIN,
  },
})

// 扫码
bot.on('scan', onScan)
// 登录
bot.on('login', onLogin)
// 登出
bot.on('logout', onLogout)
// 收到消息
bot.on('message', onMessage)
// 添加好友
bot.on('friendship', onFriendShip)
// 有人加入群
bot.on('room-join', onRoomJoin)
// 错误
bot.on('error', (e) => {
  console.error('错误信息: ', e)
  //bot.stop()

  // 如果 WechatEveryDay.memory-card.json 文件存在，删除
  if (fs.existsSync('WechatEveryDay.memory-card.json')) {
    fs.unlinkSync('WechatEveryDay.memory-card.json')
  }
  //process.exit()
})
// 启动微信机器人
function botStart() {
  bot
    .start()
    .then(() => console.log('正在登录微信...'))
    .catch((e) => console.error('启动错误: ', e))
}

// 控制启动
function handleStart(type) {
  serviceType = type
  console.log('类型: ', type)
  switch (type) {
    case 'ChatGPT':
      if (OPENAI_API_URL&&OPENAI_API_KEY) return botStart()
      console.log('请先配置 OPENAI_API_URL，OPENAI_API_KEY')
      break
    case 'Kimi':
      if (KIMI_API_KEY) return botStart()
      console.log('请先配置 KIMI_API_KEY')
      break
    case 'Xunfei':
      if (XUNFEI_APP_ID && XUNFEI_API_KEY && XUNFEI_API_SECRET) {
        return botStart()
      }
      console.log('请先配置 XUNFEI_APP_ID，XUNFEI_API_KEY，XUNFEI_API_SECRET')
      break
    case 'Dify':
      if (DIFY_API_URL && DIFY_API_KEY) return botStart()
      console.log('请先配置 DIFY_API_URL，DIFY_API_KEY')
      break
    case 'FastGpt':
      if (FASTGPT_API_URL && FASTGPT_API_KEY) return botStart()
      console.log('请先配置 FASTGPT_API_URL，FASTGPT_API_KEY')
      break
    default:
      console.log('服务类型错误')
  }
}

const serveList = [
  { name: 'Dify', value: 'Dify' },
  { name: 'FastGpt', value: 'FastGpt' },
  { name: 'ChatGPT', value: 'ChatGPT' },
  { name: 'Kimi', value: 'Kimi' },
  { name: 'Xunfei', value: 'Xunfei' },
]
const questions = [
  {
    type: 'list',
    name: 'serviceType', //存储当前问题回答的变量key，
    message: '请先选择服务类型',
    choices: serveList,
  },
]
function init() {
  inquirer
    .prompt(questions)
    .then((res) => {
      handleStart(res.serviceType)
    })
    .catch((error) => {
      console.log('错误信息:', error)
    })
}
init()