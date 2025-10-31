import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1,
  message: {
    success: false,
    message: "Too many requests, please try again after 15 mins.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default apiLimiter;