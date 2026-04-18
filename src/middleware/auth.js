const jwt = require("jsonwebtoken");

const authRequired = (req, res, next) => {
	const authHeader = req.headers["authorization"];

	if (!authHeader) {
		return res.status(401).json({ error: "Authorization header required" });
	}

	const parts = authHeader.split(" ");
	if (parts.length !== 2 || parts[0] !== "Bearer") {
		return res
			.status(401)
			.json({
				error: "Authorization header format must be: Bearer <token>",
			});
	}

	const token = parts[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch {
		return res.status(401).json({ error: "Invalid or expired token" });
	}
};

module.exports = { authRequired };
