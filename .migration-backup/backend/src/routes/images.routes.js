const express = require('express');

const router = express.Router();

const allowedHosts = new Set([
  'images.openfoodfacts.org',
  'world.openfoodfacts.org',
  'via.placeholder.com',
  'dummyimage.com',
  'dummyjson.com',
  'images.pexels.com',
  'img.spoonacular.com'
]);

const fallbackImage = (label = 'Product Image') => {
  const safeLabel = String(label).replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 24) || 'Product Image';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#d1fae5"/><stop offset="100%" stop-color="#a7f3d0"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><circle cx="200" cy="160" r="64" fill="#0f766e" opacity="0.18"/><text x="200" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#0f766e">${safeLabel}</text></svg>`;
};

const sendFallback = (res, label) => {
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(fallbackImage(label));
};

router.get('/', async (req, res) => {
  try {
    const rawUrl = String(req.query.url || '').trim();
    if (!rawUrl) {
      return sendFallback(res, 'No Image');
    }

    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return sendFallback(res, 'No Image');
    }

    if (!allowedHosts.has(parsed.hostname)) {
      return sendFallback(res, 'No Image');
    }

    const upstream = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'BulkMart-Image-Proxy/1.0'
      }
    });

    if (!upstream.ok) {
      return sendFallback(res, 'No Image');
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    if (!contentType.toLowerCase().startsWith('image/')) {
      return sendFallback(res, 'No Image');
    }

    const cacheControl = upstream.headers.get('cache-control') || 'public, max-age=86400';
    const data = Buffer.from(await upstream.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', cacheControl);
    return res.status(200).send(data);
  } catch (error) {
    return sendFallback(res, 'No Image');
  }
});

module.exports = router;
