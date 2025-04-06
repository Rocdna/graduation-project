// 格式化函数
export const formatToLocal = (utcTime: string | Date) => {
    const date = new Date(utcTime);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/\//g, '-').replace(/(\d{2}:\d{2}):\d{2}/, '$1'); // 转为 YYYY-MM-DD HH:mm
};