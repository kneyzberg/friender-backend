"use strict"

/** routes for users */

const jsonschema = require("jsonschema");
const User = require("../models/user");
const Likes = require("../models/likes");
const Friend = require("../models/friend");
const Image = require("../models/image");
const express = require("express");
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const userUpdateSchema = require("../schemas/userUpdate");


const { AWS_SECRET_KEY, AWS_ACCESS_KEY } = require("../config");
const aws = require("aws-sdk");

aws.config.update({
  secretAccessKey: AWS_SECRET_KEY,
  accessKeyId: AWS_ACCESS_KEY,
  region: 'us-west-1'
})
const s3 = new aws.S3();
const multer = require("multer");
const multerS3 = require("multer-s3");

const upload = multer({
  storage: multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: 'frienderr20',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function(req, file, cb) {
      console.log('file.....', file);
      cb(null, Date.now().toString());
    }
  })
});
upload.logResponse = function (req,res, next) {
  console.log(res)
}

const router = express.Router();


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

    return friendCheck ? res.json({match: `You have a friend match ${user2}!`}) : res.json({ liked: user2 })
  
  } catch (err) {
    return next(err);
  }
});

/** GET all users freinds
 * 
 * Return list of all users.
*/

router.get("/:username/friends", ensureCorrectUser, async function (req, res, next) {
  try {
    const friends = await Friend.getUserFriends(req.params.username);

    return res.json({ friends });
  } catch (err) {
    return next(err); 
  }
});

/** GET user images */

router.get("/:username/images", ensureCorrectUser, async function (req, res, next) {
  try {
    const images = await Image.getImages(req.params.username);
    return res.json({ images });
  } catch (err) {
    return next(err); 
  }
});
function uploadToAWS(req, res, next) {
  upload.array('upl', 1);
  console.log('req', req);
  next();
}

// TODO: add in middleware.
router.post("/:username/upload", uploadToAWS, async function (req, res, next){

  // try {
  //   const image = await Image.addImage(req.params.username, req.body.imgUrl)
  //   return res.json({ image })
  // }
  // catch (err) {
  //   return next(err);
  // }
})


module.exports = router;
