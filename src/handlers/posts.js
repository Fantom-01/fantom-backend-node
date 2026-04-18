const prisma = require("../config/database");

const getPublishedPosts = async (req, res) => {
	try {
		const posts = await prisma.post.findMany({
			where: { status: "live" },
			orderBy: { publishedAt: "desc" },
		});
		return res.json(posts);
	} catch (err) {
		console.error("Get posts error:", err);
		return res.status(500).json({ error: "Failed to fetch posts" });
	}
};

const getPostBySlug = async (req, res) => {
	const { slug } = req.params;
	try {
		const post = await prisma.post.findFirst({
			where: { slug, status: "live" },
		});
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}
		return res.json(post);
	} catch (err) {
		console.error("Get post error:", err);
		return res.status(500).json({ error: "Failed to fetch post" });
	}
};

const getAllPosts = async (req, res) => {
	try {
		const posts = await prisma.post.findMany({
			orderBy: { createdAt: "desc" },
		});
		return res.json(posts);
	} catch (err) {
		console.error("Get all posts error:", err);
		return res.status(500).json({ error: "Failed to fetch posts" });
	}
};

const createPost = async (req, res) => {
	const {
		title,
		slug,
		body,
		excerpt,
		tag,
		emoji_icon,
		read_time_minutes,
		status,
	} = req.body;

	if (!title || !slug) {
		return res.status(400).json({ error: "Title and slug are required" });
	}

	try {
		const post = await prisma.post.create({
			data: {
				title,
				slug,
				body,
				excerpt,
				tag,
				emojiIcon: emoji_icon,
				readTimeMinutes: read_time_minutes || 0,
				status: status || "draft",
				publishedAt: status === "live" ? new Date() : null,
			},
		});
		return res.status(201).json(post);
	} catch (err) {
		console.error("Create post error:", err);
		return res.status(500).json({ error: "Failed to create post" });
	}
};

const updatePost = async (req, res) => {
	const { id } = req.params;
	const {
		title,
		slug,
		body,
		excerpt,
		tag,
		emoji_icon,
		read_time_minutes,
		status,
	} = req.body;

	try {
		const existing = await prisma.post.findUnique({
			where: { id: parseInt(id) },
		});
		if (!existing) {
			return res.status(404).json({ error: "Post not found" });
		}

		const post = await prisma.post.update({
			where: { id: parseInt(id) },
			data: {
				title,
				slug,
				body,
				excerpt,
				tag,
				emojiIcon: emoji_icon,
				readTimeMinutes: read_time_minutes,
				status,
				// only stamp publishedAt the first time it goes live
				publishedAt:
					status === "live" && !existing.publishedAt
						? new Date()
						: existing.publishedAt,
			},
		});
		return res.json(post);
	} catch (err) {
		console.error("Update post error:", err);
		return res.status(500).json({ error: "Failed to update post" });
	}
};

const deletePost = async (req, res) => {
	const { id } = req.params;
	try {
		await prisma.post.delete({ where: { id: parseInt(id) } });
		return res.json({ message: "Post deleted successfully" });
	} catch (err) {
		console.error("Delete post error:", err);
		return res.status(500).json({ error: "Failed to delete post" });
	}
};

module.exports = {
	getPublishedPosts,
	getPostBySlug,
	getAllPosts,
	createPost,
	updatePost,
	deletePost,
};
