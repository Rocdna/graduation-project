// 后端短信验证码发送
import axios from 'axios';


// 配置
const host = 'https://gyytz.market.alicloudapi.com';
const path = '/sms/smsSend';
const appcode = '372725e02f2949e28886242039a509e6';
const smsSignId = '2e65b1bb3d054466b82f0c9d125465e2'; // 替换为您的短信签名 ID
const templateId = '908e94ccf08b4476ba6c876d13f084ad'; // 替换为您的模板 ID


// 封装发送短信函数
export async function sendSMS(phoneNumber, code) {
  const phone = '+8615612547009';

  // 构建查询参数
  const querys = {
    mobile: phone.replace('+86', ''),
    param: `**code**:${code},**minute**:5`,
    smsSignId,
    templateId,
  };

  // 构建请求头
  const headers = {
    Authorization: `APPCODE ${appcode}`,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  };

  try {
    const response = await axios.post(`${host}${path}`, undefined, {
      headers,
      params: querys,
    });
    return response.data; // 返回 { success: boolean, ... }
  } catch (error) {
    console.error('SMS API 错误:', error.response ? error.response.data : error.message);
    throw error;
  }
}

