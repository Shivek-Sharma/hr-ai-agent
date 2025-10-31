const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Missing or invalid Authorization header",
      });
  }

  const token = authHeader.split(" ")[1];

  if (token == null || token !== process.env.BEARER_TOKEN) {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }

  next();
};

export default authenticateToken;
