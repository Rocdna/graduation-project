export const processRefund = async (orderId, amount) => {
    try {
      // 伪代码：调用支付平台退款接口
      console.log(`处理退款：订单 ${orderId}，金额 ${amount}`);
      // 假设退款成功
      return true;
    } catch (error) {
      console.error('退款失败:', error);
      throw new Error('退款失败');
    }
};