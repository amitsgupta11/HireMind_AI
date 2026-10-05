const express = require("express");
const { listMine, markAsRead, markAllAsRead } = require("../controllers/notification.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/mine", authenticate, listMine);
router.patch("/:id/read", authenticate, markAsRead);
router.patch("/read-all", authenticate, markAllAsRead);

module.exports = router;
