import jwt from "jsonwebtoken";

export async function verifyToken(req, res, next) {
  const token = req.cookies?.auth_token;

  if (!token) return res.status(400).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(400).json({ error: "False token" });
    next();
  } catch (error) {
    return res.status(400).json({ error: "Unauthorized" });
  }
}

export async function addUserId(req, res, next) {
  const token = req.cookies?.auth_token;
  if (!token) return res.status(400).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(400).json({ error: "False token" });
    req.userId = decoded._id;
    next();
  } catch (error) {
    return res.status(400).json({ error: "Unauthorized" });
  }
}
