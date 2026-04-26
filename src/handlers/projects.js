const path = require("path");
const fs = require("fs");
const multer = require("multer");
const prisma = require("../config/database");

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary config
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup — store logos in uploads/logos/
const storage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: "fantom-portfolio/logos",
		allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
		transformation: [{ width: 200, height: 200, crop: "limit" }],
	},
});

const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		const allowed = [
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/svg+xml",
		];
		if (allowed.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Only image files are allowed"));
		}
	},
	limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
});

const getProjects = async (req, res) => {
	try {
		const projects = await prisma.project.findMany({
			orderBy: [
				{ isFeatured: "desc" },
				{ featureOrder: "asc" },
				{ createdAt: "desc" },
			],
		});
		return res.json(projects);
	} catch (err) {
		console.error("Get projects error:", err);
		return res.status(500).json({ error: "Failed to fetch projects" });
	}
};

const getAllProjects = async (req, res) => {
	try {
		const projects = await prisma.project.findMany({
			orderBy: [
				{ isFeatured: "desc" },
				{ featureOrder: "asc" },
				{ createdAt: "desc" },
			],
		});
		return res.json(projects);
	} catch (err) {
		console.error("Get all projects error:", err);
		return res.status(500).json({ error: "Failed to fetch projects" });
	}
};

const createProject = async (req, res) => {
	const {
		name,
		description,
		github_url,
		live_url,
		tags,
		is_featured,
		feature_order,
	} = req.body;

	if (!name) {
		return res.status(400).json({ error: "Project name is required" });
	}

	try {
		const project = await prisma.project.create({
			data: {
				name,
				description,
				githubUrl: github_url,
				liveUrl: live_url,
				tags: Array.isArray(tags) ? tags : [],
				isFeatured: is_featured || false,
				featureOrder: feature_order || 0,
			},
		});
		return res.status(201).json(project);
	} catch (err) {
		console.error("Create project error:", err);
		return res.status(500).json({ error: "Failed to create project" });
	}
};

const updateProject = async (req, res) => {
	const { id } = req.params;
	const {
		name,
		description,
		github_url,
		live_url,
		tags,
		is_featured,
		feature_order,
	} = req.body;

	try {
		const existing = await prisma.project.findUnique({
			where: { id: parseInt(id) },
		});
		if (!existing) {
			return res.status(404).json({ error: "Project not found" });
		}

		const project = await prisma.project.update({
			where: { id: parseInt(id) },
			data: {
				name,
				description,
				githubUrl: github_url,
				liveUrl: live_url,
				tags: Array.isArray(tags) ? tags : [],
				isFeatured: is_featured || false,
				featureOrder: feature_order || 0,
			},
		});
		return res.json(project);
	} catch (err) {
		console.error("Update project error:", err);
		return res.status(500).json({ error: "Failed to update project" });
	}
};

const deleteProject = async (req, res) => {
	const { id } = req.params;
	try {
		await prisma.project.delete({ where: { id: parseInt(id) } });
		return res.json({ message: "Project deleted successfully" });
	} catch (err) {
		console.error("Delete project error:", err);
		return res.status(500).json({ error: "Failed to delete project" });
	}
};

const uploadProjectLogo = [
	upload.single("logo"),
	async (req, res) => {
		const { id } = req.params;
		if (!req.file) {
			return res.status(400).json({ error: "Logo file is required" });
		}
		try {
			const existing = await prisma.project.findUnique({
				where: { id: parseInt(id) },
			});
			if (!existing) {
				return res.status(404).json({ error: "Project not found" });
			}

			// Cloudinary returns the full URL directly — no need to prefix with API URL
			const logoUrl = req.file.path;

			const project = await prisma.project.update({
				where: { id: parseInt(id) },
				data: { logoUrl },
			});

			return res.json({
				message: "Logo uploaded successfully",
				logo_url: project.logoUrl,
			});
		} catch (err) {
			console.error("Upload logo error:", err);
			return res.status(500).json({ error: "Failed to upload logo" });
		}
	},
];

module.exports = {
	getProjects,
	getAllProjects,
	createProject,
	updateProject,
	deleteProject,
	uploadProjectLogo,
};
