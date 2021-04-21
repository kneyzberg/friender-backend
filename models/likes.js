const db = require("../db");

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");


class Likes {

  static async checkMutualLikes(username1, username2){
    // TODO: REFACTOR INTO A SINGLE QUERY

    const sqlQuery = `SELECT id, user_username, likes
                        FROM likes
                        WHERE user_username = $1 and likes = $2`
    const res1 = await db.query(sqlQuery, [username1, username2]);
    const user1 = res1.rows[0];

    const res2 = await db.query(sqlQuery, [username2, username1]);
    const user2 = res2.rows[0];

   

    if(user1 && user2){

      const friendRes = await db.query(
        `INSERT into friends(user_1, user_2)
          VALUES($1, $2)
          RETURNING id`,
          [username1, username2]
      );

      await db.query(
        `DELETE from likes
          WHERE user_username = $1 and likes = $2`,
          [username1, username2]
      );

      await db.query(
        `DELETE from likes
          WHERE user_username = $1 and likes = $2`,
          [username2, username1]
      );

      return friendRes.rows[0];
    }

  }
}

module.exports = Likes;