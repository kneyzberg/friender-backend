"use strict";

/** Express app for jobly. */

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());



module.exports = app;