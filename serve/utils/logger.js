// utils/logger.js
import Log from '../models/log.model.js'

const createLog = async (role = 'system', action, success, message, userId = null, username = null, orderId = null) => {
  try {
    const log = new Log({
      role,
      action,
      success,
      message,
      userId,
      username,
      orderId,
      timestamp: new Date(),
    });
    await log.save();
  } catch (error) {
    console.error('日志记录失败:', error);
  }
};

export default createLog;