const router = require("express").Router();
const {
  getUsersRoute,
  createUserRoute
} = require("../controllers/users");

router.get("/", getUsersRoute);
router.post("/", createUserRoute);

module.exports = router;

