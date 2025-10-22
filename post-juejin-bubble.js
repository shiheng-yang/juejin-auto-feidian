const axios = require('axios');

const JUEJIN_COOKIE = process.env.JUEJIN_COOKIE;
const BUBBLE_CONTENT = process.env.BUBBLE_CONTENT || "早安，自动发沸点测试~";
const BUBBLE_TOPIC_ID = process.env.BUBBLE_TOPIC_ID || "";

if (!JUEJIN_COOKIE) {
  console.error('Error: JUEJIN_COOKIE is not set.');
  process.exit(1);
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

  // 确保 topic_ids 全是字符串
  const topic_ids = BUBBLE_TOPIC_ID
    ? BUBBLE_TOPIC_ID.split(',').map(id => id.trim()).filter(id => id).map(id => String(id))
    : [];

  const data = {
    "content": BUBBLE_CONTENT,
    "sync_to_org": false
  };
  if (topic_ids.length > 0) {
    data["topic_id"] = topic_ids;
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
