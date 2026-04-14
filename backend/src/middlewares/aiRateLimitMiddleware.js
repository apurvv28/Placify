const parsePositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
};

const getClientIp = (req) => {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (forwarded) return forwarded;
  return req.ip || req.socket?.remoteAddress || 'unknown';
};

const createFixedWindowLimiter = ({
  label,
  windowMs,
  maxRequests,
  keyResolver,
}) => {
  const windows = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = keyResolver(req);
    const current = windows.get(key);

    if (!current || current.expiresAt <= now) {
      windows.set(key, { count: 1, expiresAt: now + windowMs });

      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, maxRequests - 1)));
      return next();
    }

    if (current.count >= maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((current.expiresAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', '0');

      return res.status(429).json({
        message: `${label} rate limit exceeded. Please retry after ${retryAfterSeconds} seconds.`,
      });
    }

    current.count += 1;
    windows.set(key, current);

    // Opportunistic cleanup to cap memory when many keys are seen.
    if (windows.size > 5000) {
      for (const [entryKey, entry] of windows.entries()) {
        if (entry.expiresAt <= now) windows.delete(entryKey);
      }
    }

    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, maxRequests - current.count)));
    return next();
  };
};

const rateWindowMs = parsePositiveInt(process.env.AI_RATE_LIMIT_WINDOW_MS, 60 * 1000);

const resolveActorKey = (req) => {
  const userId = req.userId ? `user:${req.userId}` : '';
  if (userId) return userId;
  return `ip:${getClientIp(req)}`;
};

const chatbotRateLimit = createFixedWindowLimiter({
  label: 'Chatbot',
  windowMs: rateWindowMs,
  maxRequests: parsePositiveInt(process.env.AI_RATE_LIMIT_CHATBOT_MAX, 30),
  keyResolver: resolveActorKey,
});

const atsRateLimit = createFixedWindowLimiter({
  label: 'ATS analyzer',
  windowMs: rateWindowMs,
  maxRequests: parsePositiveInt(process.env.AI_RATE_LIMIT_ATS_MAX, 8),
  keyResolver: resolveActorKey,
});

const interviewUploadRateLimit = createFixedWindowLimiter({
  label: 'Interview evaluation',
  windowMs: rateWindowMs,
  maxRequests: parsePositiveInt(process.env.AI_RATE_LIMIT_INTERVIEW_UPLOAD_MAX, 6),
  keyResolver: resolveActorKey,
});

module.exports = {
  chatbotRateLimit,
  atsRateLimit,
  interviewUploadRateLimit,
};
