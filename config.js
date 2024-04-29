import {botConfig} from './botConfig.js';
import {systemConfig} from './systemConfig.js';
  

export const botName = botConfig.botName;  
export const roomWhiteList = botConfig.roomWhiteList;  
export const aliasWhiteList = botConfig.aliasWhiteList;  
export const keywordsWhiteList = botConfig.keywordsWhiteList;  
export const keywordsBlackList = botConfig.keywordsBlackList;  
export const autoAcceptFriend = botConfig.autoAcceptFriend;  
export const autoAcceptFriendKeywords = botConfig.autoAcceptFriendKeywords;  
export const autoFriendshipReply = botConfig.autoFriendshipReply;  
export const autoFriendshipReplyContent = botConfig.autoFriendshipReplyContent;  
export const autoRoomJoinReply = botConfig.autoRoomJoinReply;  
export const autoRoomJoinReplyContent = botConfig.autoRoomJoinReplyContent;  
export const clearMemory = botConfig.clearMemory; 

export const {  
    SN,  
    OPENAI_API_URL,  
    OPENAI_API_KEY,  
    KIMI_API_KEY,  
    XUNFEI_APP_ID,  
    XUNFEI_API_KEY,  
    XUNFEI_API_SECRET,  
    DIFY_API_URL,  
    DIFY_API_KEY,  
    FASTGPT_API_URL,  
    FASTGPT_API_KEY  
  } = systemConfig;