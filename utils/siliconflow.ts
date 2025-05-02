const API_KEY = process.env.NEXT_PUBLIC_SF_API_KEY || 'sk-ohegjcstojasnvkdjtbuglohibqwndegkfwnprbvugwoluhv';
const BASE_URL = 'https://api.siliconflow.cn/v1';

const SYSTEM_PROMPT = `你是一名快递取件助手。请从用户输入的文本或图片中，提取所有快递码及其所属快递分区。

快递分区规则如下：
1. "菜鸟驿站" - 包含菜鸟、蜂鸟等字样的快递
2. "韵达京东" - 包含韵达、京东等字样的快递（注意：单独提到"韵达快递"或"京东快递"都属于"韵达京东"分区）
3. "顺丰快递" - 包含顺丰、圆通、中通等字样的快递

如果用户没有明确提到快递公司，请根据取件码格式和上下文推断分区。

输出格式要求如下，每行一个快递：[快递分区]（快递码）
只输出提取结果，不要输出其他内容。`;

/**
 * 文本识别快递码及分区（系统提示词引导输出[区域]（快递码）格式）
 * @param {string} text - 用户输入文本
 * @returns {Promise<{code: string, area: string}[]>} 结构化卡片数组
 */
export async function recognizeExpressByText(text: string): Promise<{code: string, area: string}[]> {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: text }
  ];
  const body = {
    model: 'THUDM/GLM-4-9B-0414',
    messages,
    stream: false,
    max_tokens: 256
  };
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('API请求失败');
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  // 批量提取[区域]（快递码）格式
  const matches = [...content.matchAll(/\[(.*?)\]（(.*?)）/g)];
  return matches.map(m => ({ area: m[1], code: m[2] }));
}

/**
 * 图片识别快递码及分区（系统提示词引导输出[区域]（快递码）格式，支持多图串行识别）
 * @param {string[]} base64Images - 图片base64数组
 * @returns {Promise<{code: string, area: string}[]>} 结构化卡片数组
 */
export async function recognizeExpressByImages(base64Images: string[]): Promise<{code: string, area: string}[]> {
  let allContent = '';
  for (const b64 of base64Images) {
    const imageContents = [{
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${b64}`, detail: 'low' }
    }];
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: [
          ...imageContents,
          { type: 'text', text: '请识别图片中的快递取件码及其所属区域，输出格式为[快递分区]（快递码）。' }
        ]
      }
    ];
    const body = {
      model: 'Qwen/Qwen2.5-VL-32B-Instruct',
      messages,
      stream: false,
      max_tokens: 256
    };
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('API请求失败');
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    allContent += '\n' + content;
  }
  // 批量提取[区域]（快递码）格式
  const matches = [...allContent.matchAll(/\[(.*?)\]（(.*?)）/g)];
  return matches.map(m => ({ area: m[1], code: m[2] }));
} 