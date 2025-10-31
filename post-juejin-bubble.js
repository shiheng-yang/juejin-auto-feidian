const axios = require('axios');

const JUEJIN_COOKIE = process.env.JUEJIN_COOKIE;
const BUBBLE_TOPIC_ID = process.env.BUBBLE_TOPIC_ID || ""; // 圈子id
const COMMENT_TEXT = process.env.COMMENT_TEXT || "马到成功！🐎"; // 评论内容

if (!JUEJIN_COOKIE) {
  console.error('Error: JUEJIN_COOKIE is not set.');
  process.exit(1);
}

// 计算距离下一个马年（2026-02-16）还有多少天
function getDaysToNextHorseYear() {
  const now = new Date();
  const nextHorseYear = new Date('2026-02-16T00:00:00+08:00');
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.ceil((nextHorseYear.getTime() - now.getTime()) / msPerDay);
  return days;
}

function getDynamicContent() {
  const days = getDaysToNextHorseYear();
  return `距离马年还有${days}天! 祝大家马年大吉 ! ! !`;
}

// 发布沸点
async function postBubble() {
  const url = 'https://api.juejin.cn/content_api/v1/short_msg/publish';
  const headers = {
    'Cookie': JUEJIN_COOKIE,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Origin': 'https://juejin.cn',
    'Referer': 'https://juejin.cn/',
  };

  const data = {
    content: getDynamicContent(),
    sync_to_org: false,
  };
  if (BUBBLE_TOPIC_ID.trim()) data.topic_id = BUBBLE_TOPIC_ID.trim();

  try {
    const response = await axios.post(url, data, { headers });
    if (response.data && response.data.err_no === 0) {
      const msg_id = response.data.data.msg_id;
      console.log('✅ 沸点发送成功，msg_id:', msg_id);

      // 发布评论
      // await postComment(msg_id);
    } else {
      console.error('❌ 沸点发送失败:', response.data);
      process.exit(1);
    }
  } catch (error) {
    console.error('🚨 请求异常:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

// ==== 获取沸点列表 API ====
const FEED_URL = 'https://api.juejin.cn/recommend_api/v1/short_msg/recommend'; 
const COMMENT_URL = 'https://api.juejin.cn/interact_api/v1/comment/publish';

// ==== 通用头 ====
const headers = {
  'Cookie': JUEJIN_COOKIE,
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Origin': 'https://juejin.cn',
  'Referer': 'https://juejin.cn/',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9'
};

// ==== 获取主页沸点列表 ====
async function getFirstMsgId() {
  try {
    const res = await axios.post(FEED_URL, { id_type: 4, sort_type: 200, cursor: "0", limit: 20 }, { headers });
    if (res.data.err_no === 0) {
      const list = res.data.data;
      if (list && list.length > 0) {
        const first = list[0].msg_id;
        console.log('✅ 获取第一条沸点 msg_id:', first);
        return first;
      } else {
        console.error('⚠️ 没有获取到沸点列表');
      }
    } else {
      console.error('❌ 获取沸点失败:', res.data);
    }
  } catch (err) {
    console.error('🚨 请求沸点列表出错:', err.response ? err.response.data : err.message);
  }
  return null;
}

// ==== 评论函数 ====
async function postComment(msg_id) {
  const data = {
    item_id: msg_id,
    item_type: 4,
    comment_content: COMMENT_TEXT,
  };

  try {
    await new Promise(r => setTimeout(r, 2000)); // 延迟防风控
    const res = await axios.post(COMMENT_URL, data, { headers });
    if (res.data?.err_no === 0) {
      console.log('💬 评论成功:', COMMENT_TEXT);
    } else {
      console.error('❌ 评论失败:', JSON.stringify(res.data, null, 2));
    }
  } catch (err) {
    console.error('🚨 评论异常:', err.response ? err.response.data : err.message);
  }
}

// ==== 主流程 ====
(async function main() {
  const msg_id = await getFirstMsgId();
  if (msg_id) {
    await postComment(msg_id);
  }
})();


postBubble();

setTimeout(()=>{
  postBubble();
},10000)
