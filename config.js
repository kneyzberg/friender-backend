"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;

const PORT = +process.env.PORT || 3001;


// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
      ? "friender_test"
      : process.env.DATABASE_URL || "friender";
}


const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;


module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
  AWS_SECRET_KEY,
  AWS_ACCESS_KEY
};
