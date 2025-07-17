const createError = require("http-errors");
const userService = require("../services/users.js");

exports.getUsersRoute = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).send(users);
  } catch (err) {
    console.log(err.message);
    if (err.status === 404) {
      next(createError(404, "Users does not exist."));
    } else {
      next(createError(500, "Error retrieving users."));
    }
  }
};

exports.createUserRoute = async (req, res, next) => {
  try {
    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      googleId: req.body.googleId,
      displayName: req.body.displayName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      profile: req.body.profile
    };

    const createdUser = await userService.createUser(userData);
    
    console.log(createdUser);
    res.status(201).json(createdUser);
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};