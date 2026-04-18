require("dotenv/config");

// Fix BigInt serialization
BigInt.prototype.toJSON = function () {
	return Number(this);
};

const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes/routes");

const app = express();

// CORS
app.use(
	cors({
		origin: [
			"http://localhost:5173",
			process.env.FRONTEND_URL || "",
		].filter(Boolean),
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Origin", "Content-Type", "Authorization"],
		credentials: true,
	}),
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded logos as static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// All routes
app.use("/api", routes);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
