const db = require("../db");
const bcrypt = require("bcrypt");

const { sqlForPartialUpdate } = require("../helpers/sql");

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Relate to querying DB for user Data */

class User {

  /** auth user w username, password.
   * 
   * Returns { username, first_name, last_name, email }
   */
  static async authenticate(username, password) {
    const res = await db.query(
      `SELECT username,
              password,
              first_name AS firstName,
              last_name AS lastName, 
              email
      FROM users
      WHERE username = $1`,
      [username]
    );

    const user = res.rows[0];

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }
  }

  // register/signup user 
  static async register({ username, password, firstName, lastName, email }) {

    const checkDuplicates = await db.query(
      `SELECT username
           FROM users
           WHERE username = $1`,
      [username]
    );

    if (checkDuplicates.rows[0]) {
      throw new BadRequestError(`This username already exists : ${username}`)
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const res = await db.query(
      `INSERT into users(username, password, first_name, last_name, email)
        VALUES($1, $2, $3, $4, $5)
        RETURNING username, first_name as firstName, last_name as lastName, email`,
      [username, hashedPassword, firstName, lastName, email]
    )

    const user = res.rows[0];

    return user;

  }

  // get a single user
  static async getUser(username) {
    const userRes = await db.query(
      `SELECT username,
              first_name as firstName, 
              last_name as lastName,
              email, 
              hobbies, 
              interests,
              zip,
              radius
        FROM users
        WHERE username = $1`,
      [username],
    )
    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user with ${username} found`);

    return user;
  }

  static async getAllUsers() {
    const res = await db.query(
      `SELECT username,
              first_name as firstName, 
              last_name as lastName,
              email, 
              hobbies, 
              interests,
              zip,
              radius
        FROM users
        ORDER BY username`);

    return res.rows;
  }

  static async updateUserProfile(username, data) {
    // if (data.password) {
    //   data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    // }

    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        firstName: "first_name",
        lastName: "last_name"
      });

    const usernameIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                                SET ${setCols} 
                                WHERE username = ${usernameIdx} 
                                RETURNING username,
                                          first_name AS "firstName",
                                          last_name AS "lastName",
                                          email,
                                          hobbies,
                                          interests, 
                                          zip, 
                                          radius`;
    const res = await db.query(querySql, [...values, username]);
    const user = res.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }


  static async remove(username) {
    let res = await db.query(
      `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
      [username],
    );
    const user = res.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  static async addUserLike(username1, username2) {

    let querySQL = `SELECT username 
                        FROM users
                        WHERE username = $1`

    const userCheck1 = await db.query(querySQL, [username1]);
    const user1 = userCheck1.rows[0];
    if (!user1) throw new NotFoundError(`No username: ${username}`);

    const userCheck2 = await db.query(querySQL, [username2])
    const user2 = userCheck2.rows[0];
    if (!user2) throw new NotFoundError(`No username: ${username}`);

    await db.query(
      `INSERT INTO likes(user_username, likes)
        VALUES($1, $2)`,
        [username1, username2]);
    
  }

}

module.exports = User 