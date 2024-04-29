const Base = require('./base.js');

module.exports = class extends Base {
  async indexAction() {
    const os = require('os');
    const hostname = os.hostname();
    this.assign('machine', think.md5(hostname).toUpperCase());
    const config = await import('../../../config.js');
    this.assign('config', config);
    return this.display();
  }



  async botAction(){
    const config=this.post('config');
    const fs=require('fs');
    fs.writeFileSync('./botConfig.js',`export const botConfig =${config};`);
    this.success(config);
  }

  async systemAction(){
    const config=this.post('config');
    const fs=require('fs');
    fs.writeFileSync('./systemConfig.js',`export const systemConfig =${config};`);
    this.success(config);
  }


  async snAction(ctx) {
    const crypto = require('crypto');  
    const moment = require('moment'); 

    this.success(generateActivationCode('BC8912368E4983FB78B94110D83DD6D3'));

    //this.success(validateActivationCode('BC8912368E4983FB78B94110D83DD6D3','c4b360b5d86a4e0d2b8c7a8ff61b19412a8ca3c3fd5ce760009e7ef927af3e9d1714290666'));
    
    
    // 生成激活码，包含机器码和当前时间戳的哈希值  
    function generateActivationCode(machineCode) {  
      const currentTimestamp = Math.round(Date.now() / 1000); // 当前UNIX时间戳（秒）  
      const combinedData = `${machineCode}${currentTimestamp}`;  
      const hashedData = crypto.createHash('sha256').update(combinedData).digest('hex');  
      const activationCode = `${hashedData}${currentTimestamp}`; // 将哈希值和时间戳拼接成激活码  
      return activationCode;  
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
  }
};
