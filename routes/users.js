"use strict"

/** routes for users */

const jsonschema = require("jsonschema");
const User = require("../models/user");
const Likes = require("../models/likes");

const express = require("express");
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const userUpdateSchema = require("../schemas/userUpdate");
const app = require("../app");
const friendRoutes = require("./friends");

const router = express.Router();


router.use('/:username/friends', function(req, res, next){
  req.username = req.params.username;
  next();
}, friendRoutes);




/** GET all users error
 * 
 * Return list of all users.
*/

router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const users = await User.getAllUsers();
    return res.json({ users });
  } catch (err) {
    return next(err); 
  }
});

/** GET user
 * 
 * Returns all details on certain users.
 */

router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.getUser(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
})

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email}

 **/

 router.patch("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.updateUserProfile(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[username]  =>  { deleted: username }
 *
 **/

router.delete("/:username", ensureCorrectUser, async function (req, res, next) {
try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});

/** POST / add user1 + user2 to likes table
 
 * */

 router.post("/:username/explore/:likedUsername", ensureCorrectUser, async function (req, res, next) {
  try {
    const user1 = req.params.username;
    const user2 = req.params.likedUsername;
    await User.addUserLike(user1, user2);
    const friendCheck = await Likes.checkMutualLikes(user1, user2);
    console.log(friendCheck, "friendCheck response")

    return friendCheck ? res.json({match: `You have a friend match ${user2}!`}) : res.json({ liked: user2 })
  
  } catch (err) {
    return next(err);
  }
});

/** GET all users freinds
 * 
 * Return list of all users.
*/



module.exports = router;
