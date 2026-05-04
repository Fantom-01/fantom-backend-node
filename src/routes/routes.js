const express = require("express");
const router = express.Router();
const authHandler = require("../handlers/auth");
const postsHandler = require("../handlers/posts");
const projectsHandler = require("../handlers/projects");
const contactHandler = require("../handlers/contact");
const { authRequired } = require("../middleware/auth");
const prisma = require("../config/database");

// Health check
router.get("/health", async (req, res) => {
  try {
    await prisma.post.count();
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "error" });
  }
});

// --- Auth ---
router.post("/auth/login", authHandler.login);
router.post("/seed", authHandler.seedAdmin);

// --- Public: Posts ---
router.get("/posts", postsHandler.getPublishedPosts);
router.get("/posts/:slug", postsHandler.getPostBySlug);

// --- Public: Projects ---
router.get("/projects", projectsHandler.getProjects);

// --- Public: Contact ---
router.post("/contact", contactHandler.sendContactEmail);

// --- Admin: Posts ---
router.get("/admin/posts", authRequired, postsHandler.getAllPosts);
router.post("/admin/posts", authRequired, postsHandler.createPost);
router.put("/admin/posts/:id", authRequired, postsHandler.updatePost);
router.delete("/admin/posts/:id", authRequired, postsHandler.deletePost);

// --- Admin: Projects ---
router.get("/admin/projects", authRequired, projectsHandler.getAllProjects);
router.post("/admin/projects", authRequired, projectsHandler.createProject);
router.put("/admin/projects/:id", authRequired, projectsHandler.updateProject);
router.delete(
	"/admin/projects/:id",
	authRequired,
	projectsHandler.deleteProject,
);
router.post(
	"/admin/projects/:id/logo",
	authRequired,
	projectsHandler.uploadProjectLogo,
);

module.exports = router;
