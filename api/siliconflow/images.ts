import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * 接收 JSON: { model: string, prompt: string, ... }
 * 转发到 POST https://api.siliconflow.cn/v1/images/generations
 *
 * 需要环境变量: SILICONFLOW_API_KEY, 可选 SILICONFLOW_BASE_URL
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const apiKey = process.env.SILICONFLOW_API_KEY;
  const base = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn';
  if (!apiKey) return res.status(500).json({ error: 'SILICONFLOW_API_KEY not configured' });

  try {
    // @ts-ignore
    const fetch = (await import('node-fetch')).default;

    const upstream = await fetch(`${base}/v1/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    const text = await upstream.text();
    res.status(upstream.status).setHeader('Content-Type', contentType).send(text);
  } catch (err: any) {
    console.error('siliconflow images proxy error', err);
    res.status(500).json({ error: 'proxy error', detail: err?.message || String(err) });
  }
}