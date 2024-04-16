const router = require("express").Router();
const authController = require("../controllers/authController");
const { upload } = require("../config/handleUpload");
const UserController = require("../controllers/userController");
router.get("/", (req, res) => {
  res.send("hello");
});
router.post(
  "/register",
  upload.single("profilePhoto"),
  authController.register
);
router.get("/:userId", UserController.getUserById);
router.post("/login", authController.login);
router.post("/addExpense/:id", UsersController.addExpense);
module.exports = router;
