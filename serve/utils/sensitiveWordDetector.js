import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录（__dirname 在 ES Modules 中不可用）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodejieba = await import('nodejieba');


// 初始化 nodejieba
nodejieba.load();

// 加载敏感词库
const sensitiveWordsFile = path.join(__dirname, '../config/sensitive_words.txt');
const sensitiveWords = fs.readFileSync(sensitiveWordsFile, 'utf-8')
  .split('\n')
  .map(word => word.trim())
  .filter(word => word.length > 0);


// 将敏感词添加到 nodejieba 词典
sensitiveWords.forEach(word => {
    nodejieba.insertWord(word);
});


// 检测敏感词的函数
const detectSensitiveWords = (text) => {
    if (!text || typeof text !== 'string') return [];
  
    // 分词
    const words = nodejieba.cut(text);
    
    // 检测敏感词
    const foundSensitiveWords = words.filter(word => sensitiveWords.includes(word));
    
    return foundSensitiveWords;
};

export default detectSensitiveWords;
