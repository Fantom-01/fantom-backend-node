const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

const login = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res
			.status(400)
			.json({ error: "Email and password are required" });
	}

	try {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		const valid = await bcrypt.compare(password, user.password);
		if (!valid) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			process.env.JWT_SECRET,
			{ expiresIn: "24h" },
		);

		return res.json({
			token,
			user: { id: user.id, email: user.email },
		});
	} catch (err) {
		console.error("Login error:", err);
		return res.status(500).json({ error: "Internal server error" });
	}
};

const seedAdmin = async (req, res) => {
	try {
		const existing = await prisma.user.findFirst();
		if (existing) {
			return res.status(400).json({ error: "Admin user already exists" });
		}

		const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
		const user = await prisma.user.create({
			data: {
				email: process.env.ADMIN_EMAIL,
				password: hash,
			},
		});

		return res
			.status(201)
			.json({ message: "Admin user created successfully", id: user.id });
	} catch (err) {
		console.error("Seed error:", err);
		return res.status(500).json({ error: "Failed to create admin user" });
	}
};

module.exports = { login, seedAdmin };
