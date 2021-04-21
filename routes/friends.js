const { getUserFriends } = require("../models/friend")

"use strict"

/** routes for users */

const User = require("../models/user");
const Likes = require("../models/likes");
const Friend = require("../models/friend");

const express = require("express");
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const app = require("../app");
const router = express.Router();



router.get("/", ensureCorrectUser, async function (req, res, next) {
  try {
    const friends = await Friend.getUserFriends(req.username);
    return res.json({ friends });
  } catch (err) {
    return next(err); 
  }
});




module.exports = router;