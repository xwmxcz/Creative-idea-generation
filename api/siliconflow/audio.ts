import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * 接收 JSON:
 * { fileName: string, fileBase64: string, model?: string }
 *
 * 将 base64 解码并用 multipart/form-data 转发到
 * POST https://api.siliconflow.cn/v1/audio/transcriptions
 *
 * 需要环境变量: SILICONFLOW_API_KEY, 可选 SILICONFLOW_BASE_URL
 */

export const config = {
  api: {
    bodyParser: {
      // 接受较大的 base64 payload（如需更大可调整）
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fileName, fileBase64, model = 'FunAudioLLM/SenseVoiceSmall' } = req.body || {};

  if (!fileName || !fileBase64) {
    return res.status(400).json({ error: 'fileName and fileBase64 are required' });
  }

  const apiKey = process.env.SILICONFLOW_API_KEY;
  const base = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn';
  if (!apiKey) return res.status(500).json({ error: 'SILICONFLOW_API_KEY not configured' });

  try {
    // 延迟 import 避免在不需要时引入依赖
    // 需安装 form-data 和 node-fetch（或在 Node 18+ 使用全局 fetch 与内置 FormData）
    // @ts-ignore
    const FormData = (await import('form-data')).default;
    // @ts-ignore
    const fetch = (await import('node-fetch')).default;

    const buffer = Buffer.from(fileBase64, 'base64');

    const form = new FormData();
    form.append('model', model);
    // 字段名与 curl 示例一致： file=@example-file
    form.append('file', buffer, { filename: fileName });

    const upstream = await fetch(`${base}/v1/audio/transcriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        // form.getHeaders() 包含 multipart boundary
        ...form.getHeaders(),
      } as any,
      body: form as any,
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    const text = await upstream.text();
    res.status(upstream.status).setHeader('Content-Type', contentType).send(text);
  } catch (err: any) {
    console.error('siliconflow audio proxy error', err);
    res.status(500).json({ error: 'proxy error', detail: err?.message || String(err) });
  }
}
