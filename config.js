"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3001;


// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
      ? "friender_test"
      : process.env.DATABASE_URL || "friender";
}


const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;