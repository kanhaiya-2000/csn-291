const express = require("express");
//let keep it simple and more secure by defining single model for both type of user
const router = express.Router();
const {
  getUsers,
  getUser,
  follow,
  sendNotice,
  checkUser,
  unfollow,  
  publicfeed,
  chatList,
  searchUser,
  editDetails,
  changePassword,
  requestotp,
} = require("../controllers/user");
const { Verify } = require("../middleware/auth");

router.route("/").get(Verify, getUsers);
router.route("/").put(Verify, editDetails);
router.route('/changepassword').post(Verify,changePassword);
router.route('/requestpasswordotp').post(Verify,requestotp);
router.route("/notice").post(Verify,sendNotice);
router.route("/feed").get(Verify, publicfeed);
router.route("/chat").post(Verify,chatList);
router.route("/search/:reg").get(searchUser);
router.route("/:username").get(Verify, getUser);
router.route("/:username").post(Verify,checkUser);
router.route("/:id/friend").get(Verify, follow);
router.route("/:id/unfriend").get(Verify, unfollow);

module.exports = router;