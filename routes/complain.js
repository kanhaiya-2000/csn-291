const express = require("express");

const router = express.Router();
const {
  getPosts,
  getPost,
  addPost,
  deletePost,
  Highlight,
  toggleLike,
  toggleSave,
  resolveComplaint,
  addComment,
  deleteComment,
  reportComplain,
  searchPost,
} = require("../controllers/post");
const { Verify } = require("../middleware/auth");

router.route("/").get(getPosts).post(Verify, addPost);
router.route("/search").get(searchPost);
router.route("/highlight").get(Verify,Highlight);
router.route("/resolve/:id").post(Verify,resolveComplaint);
router.route("/:id").get(Verify, getPost).delete(Verify, deletePost);
router.route("/:id/togglelike").get(Verify, toggleLike);
router.route("/:id/togglesave").get(Verify, toggleSave);
router.route("/:id/comments").post(Verify, addComment);
router.route('/report/:id').post(Verify,reportComplain);
router.route("/:id/comments/:commentId").delete(Verify, deleteComment);

module.exports = router;