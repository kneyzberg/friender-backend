const db = require("../db");

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

class Friend {

  static async getUserFriends(username){
    let res = await db.query(
      `SELECT id, user_1, user_2
        FROM friends
        WHERE user_1 = $1 or user_2 = $1`,
        [username]
    )

    return res.rows;
  }
}
  
module.exports = Friend;