const db = require("../db");

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

class Image {
  static async getImages(username) {
    const res = await db.query( `
      SELECT image_url AS "imgUrl"
      FROM images
      WHERE username = $1
    `, [username])

    const userImages = res.rows;

    if(!userImages) throw new NotFoundError(`No profile images found`);

    return userImages;
  }

  static async addImage(username, imgUrl) {
    const res = await db.query(
      `INSERT INTO images(user_username, image_url)
       VALUES ($1, $2)
       RETURNING user_username AS "username", image_url AS "imgURL"`
    , [username, imgUrl])
    
    return res.rows[0];
  }
}

module.exports = Image