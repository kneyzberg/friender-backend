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
    );

    const friends = res.rows;

    const friendsArr = friends.map(friend => friend.user_1 === username ? friend.user_2 : friend.user_1);

    const friendsRes = await db.query(
      `SELECT username, first_name AS "firstName", last_name AS "lastName"
          FROM users
          WHERE username = ANY($1::text[])`,
          [(friendsArr)]
    )

    return friendsRes.rows ;
  }
}
  
module.exports = Friend;