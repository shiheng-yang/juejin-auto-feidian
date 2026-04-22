const axios = require('axios');

const JUEJIN_COOKIE = process.env.JUEJIN_COOKIE;
const BUBBLE_TOPIC_ID = "6824710203301167112"; // 圈子id
const COMMENT_TEXT = "马111到成功！🐎"; // 评论内容

if (!JUEJIN_COOKIE) {
  console.error('Error: JUEJIN_COOKIE is not set.');
  process.exit(1);
}

// 计算距离下一个马年（2026-02-16）还有多少天
function getDaysToNextHorseYear() {
  const now = new Date();
  const nextHorseYear = new Date('2027-02-06T00:00:00+08:00');
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.ceil((nextHorseYear.getTime() - now.getTime()) / msPerDay);
  return days;
}

// 计算距离2027年还有多少天
function getDaysTo2026NewYear() {
  const now = new Date();
  const newYear2026 = new Date('2027-01-01T00:00:00+08:00');
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.ceil((newYear2026.getTime() - now.getTime()) / msPerDay);
  return days;
}

// 发布沸点
async function postBubble(content) {
  const url = 'https://api.juejin.cn/content_api/v1/short_msg/publish';
  const headers = {
    'Cookie': JUEJIN_COOKIE,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Origin': 'https://juejin.cn',
    'Referer': 'https://juejin.cn/',
  };

  const data = {
    content: content,
    sync_to_org: false,
    topic_id: BUBBLE_TOPIC_ID,
    
  };
 // mentions:[]
  try {
    const response = await axios.post(url, data, { headers });
    if (response.data && response.data.err_no === 0) {
      const msg_id = response.data.data.msg_id;
      console.log('✅ 沸点发送成功，msg_id:', msg_id);

      // 发布评论
      await postComment(msg_id);
      return true;
    } else {
      console.error('❌ 沸点发送失败:', response.data);
      return false;
    }
  } catch (error) {
    console.error('🚨 请求异常:', error.response ? error.response.data : error.message);
    return false;
  }
}

// 发表评论
async function postComment(msg_id) {
  const url = 'https://api.juejin.cn/interact_api/v1/comment/publish'
  const headers = {
    'Cookie': JUEJIN_COOKIE,
    'Content-Type': 'application/json',
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Origin': 'https://juejin.cn',
    'Referer': 'https://juejin.cn/',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br'
  }
  const data = { item_id: msg_id, item_type: 4, comment_content: COMMENT_TEXT, comment_pics:[],client_type:2608 }
  
  try {
    // 延迟2秒再评论，避免接口节流
    await new Promise((r) => setTimeout(r, 10000))
    const res = await axios.post(url, data, { headers })
    if (res.data?.err_no === 0) {
      console.log('💬 评论发送成功:', COMMENT_TEXT)
    } else {
      console.error('❌ 评论失败:', JSON.stringify(res.data, null, 2))
    }
  } catch (err) {
    console.error('🚨 评论异常:', err.response ? err.response.data : err.message)
  }
}

// 主执行函数
async function main() {
  console.log('🚀 开始发布沸点...');
  
  // 第一条沸点：距离马年倒计时
  const horseYearDays = getDaysToNextHorseYear();
  const horseYearContent = `距离羊年还有${horseYearDays}天! 祝大家羊年大吉 ! ! !`;
  
  console.log(`📅 发布第一条沸点：${horseYearContent}`);
  const success1 = await postBubble(horseYearContent);
  
  if (success1) {
    console.log('⏰ 等待10秒后发布第二条沸点...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 第二条沸点：距离2026年元旦倒计时
    const newYearDays = getDaysTo2026NewYear();
    const newYearContent = `距离2027还有${newYearDays}天! 祝大家新年快乐 ! ! !`;

 
    
    console.log(`📅 发布第二条沸点：${newYearContent}`);
    await postBubble(newYearContent);
  }
}

main().catch(console.error);
