const axios = require('axios');

const JUEJIN_COOKIE = process.env.JUEJIN_COOKIE;
const BUBBLE_TOPIC_ID = process.env.BUBBLE_TOPIC_ID || ""; // 圈子id

if (!JUEJIN_COOKIE) {
  console.error('Error: JUEJIN_COOKIE is not set.');
  process.exit(1);
}

// 计算距离下一个马年（2026-02-16）还有多少天
function getDaysToNextHorseYear() {
  const now = new Date();
  const nextHorseYear = new Date('2026-02-16T00:00:00+08:00'); // 除夕
  const msPerDay = 1000 * 60 * 60 * 24;
  // UTC转换，防止时区影响
  const days = Math.ceil((nextHorseYear.getTime() - now.getTime()) / msPerDay);
  return days;
}

function getDynamicContent() {
  const days = getDaysToNextHorseYear();
  return `距离马年还有${days}天! 祝大家马年大吉 ! ! !`;
}

async function postBubble() {
  const url = 'https://api.juejin.cn/content_api/v1/short_msg/publish';

  const headers = {
    'Cookie': JUEJIN_COOKIE,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Origin': 'https://juejin.cn',
    'Referer': 'https://juejin.cn/',
  };

  // 只传字符串，不用数组
  const topic_id = BUBBLE_TOPIC_ID.trim();

  const data = {
    "content": getDynamicContent(),
    "sync_to_org": false
  };
  if (topic_id) {
    data["topic_id"] = topic_id;
  }

  try {
    const response = await axios.post(url, data, { headers });
    if (response.data && response.data.err_no === 0) {
      console.log('沸点发送成功:', response.data);
    } else {
      console.error('沸点发送失败:', response.data);
      process.exit(1);
    }
  } catch (error) {
    console.error('请求异常:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

postBubble();
