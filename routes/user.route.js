const express = require("express");
const router = express.Router();
const { postSignUp, getSignUp, postSignIn, getSignIn, getDashboard, getAllUsers } = require("../controllers/user.controller");

router.get("/signup", getSignUp);
router.post("/register", postSignUp);
router.get("/signin", getSignIn);
router.post("/login", postSignIn);
router.get("/dashboard", getDashboard);
router.get("/registeredUsers", getAllUsers);

module.exports = router;