import { botName, roomWhiteList, aliasWhiteList, keywordsWhiteList,keywordsBlackList } from '../../config.js'
import { getServe } from './serve.js'

/**
 * 默认消息发送
 * @param msg
 * @param bot
 * @param ServiceType 服务类型 'GPT' | 'Kimi'
 * @returns {Promise<void>}
 */
export async function defaultMessage(msg, bot, ServiceType = 'GPT') {
  const getReply = getServe(ServiceType)
  const contact = msg.talker() // 发消息人
  const receiver = msg.to() // 消息接收人
  const content = msg.text() // 消息内容
  const room = msg.room() // 是否是群消息
  const roomName = (await room?.topic()) || null // 群名称
  const alias = (await contact.alias()) || (await contact.name()) // 发消息人昵称
  const remarkName = await contact.alias() // 备注名称
  const name = await contact.name() // 微信名称
  const isText = msg.type() === bot.Message.Type.Text // 消息类型是否为文本
  const isRoom = roomWhiteList.includes(roomName) && content.includes(`${botName}`) // 是否在群聊白名单内并且艾特了机器人
  const isAlias = aliasWhiteList.includes(remarkName) || aliasWhiteList.includes(name) // 发消息的人是否在联系人白名单内
  const isBotSelf = botName === remarkName || botName === name || 1 === 2// 是否是机器人自己
  const isInKeywordsWhiteList = keywordsWhiteList.some(item => content.includes(item))// 是否触发关键词列表
  const isInkeywordsBlackList = keywordsBlackList.some(item => content.includes(item))// 是否在关键词黑名单中


  if (isBotSelf || !isText) return // 如果是机器人自己发送的消息或者消息类型不是文本则不处理
  if (isInkeywordsBlackList){// 关键词黑名单
    if (room) {
      await room.say(`@${name} 此问题不在回答范围内`);
    }else{
      await contact.say('此问题不在回答范围内')
    }
    return 
  } 

  try {
    // 关键词触发回复
    if (isInKeywordsWhiteList) {
      if (room) {
        const question = await msg.mentionText() || content.replace(`${botName}`, '') // 去掉艾特的消息主体
        console.log('内容: ', question)
        const response = await getReply(question,name)
        await room.say(`@${name} ${response}`);
      } else {
        console.log('内容: ', content)
        const response = await getReply(content,name)
        await contact.say(response)
      }
      return;
    }
    // 区分群聊和私聊
    if (isRoom && room) {
      const question = await msg.mentionText() || content.replace(`${botName}`, '') // 去掉艾特的消息主体
      console.log('内容: ', question)
      const response = await getReply(question,name)
      await room.say(`@${name} ${response}`);
    }
    // 私人聊天，白名单内的直接发送
    if (isAlias && !room) {
      console.log('内容: ', content)
      const response = await getReply(content,name)
      await contact.say(response)
    }
  } catch (e) {
    console.error(e)
  }

}

/**
 * 分片消息发送
 * @param message
 * @param bot
 * @returns {Promise<void>}
 */
export async function shardingMessage(message, bot) {
  const talker = message.talker()
  const isText = message.type() === bot.Message.Type.Text // 消息类型是否为文本
  if (talker.self() || message.type() > 10 || (talker.name() === '微信团队' && isText)) {
    return
  }
  const text = message.text()
  const room = message.room()
  if (!room) {
    console.log(`Chat GPT Enabled User: ${talker.name()}`)
    const response = await getChatGPTReply(text)
    await trySay(talker, response)
    return
  }
  let realText = splitMessage(text)
  // 如果是群聊但不是指定艾特人那么就不进行发送消息
  if (text.indexOf(`${botName}`) === -1) {
    return
  }
  realText = text.replace(`${botName}`, '')
  const topic = await room.topic()
  const response = await getChatGPTReply(realText)
  const result = `${realText}\n ---------------- \n ${response}`
  await trySay(room, result)
}

// 分片长度
const SINGLE_MESSAGE_MAX_SIZE = 500

/**
 * 发送
 * @param talker 发送哪个  room为群聊类 text为单人
 * @param msg
 * @returns {Promise<void>}
 */
async function trySay(talker, msg) {
  const messages = []
  let message = msg
  while (message.length > SINGLE_MESSAGE_MAX_SIZE) {
    messages.push(message.slice(0, SINGLE_MESSAGE_MAX_SIZE))
    message = message.slice(SINGLE_MESSAGE_MAX_SIZE)
  }
  messages.push(message)
  for (const msg of messages) {
    await talker.say(msg)
  }
}

/**
 * 分组消息
 * @param text
 * @returns {Promise<*>}
 */
async function splitMessage(text) {
  let realText = text
  const item = text.split('- - - - - - - - - - - - - - -')
  if (item.length > 1) {
    realText = item[item.length - 1]
  }
  return realText
}
