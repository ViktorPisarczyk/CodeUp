import { createToken } from "../middlewares/jwt.js";
import { User } from "../models/userModel.js";

let cookieOptions = {
  secure: true,
  httpOnly: true,
  sameSite: "Strict",
  maxAge: 3600000,
};

export const signup = async (req, res, next) => {
  try {
    const { username, firstName, lastName, email, password, role } = req.body;
    const newUser = await User.create({
      username,
      firstName,
      lastName,
      email,
      password,
      role,
    });

    const token = await createToken({ id: newUser._id, role: newUser.role });

    res.cookie("access_token", token, cookieOptions).send({ newUser, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    const matchedPWD = await user.auth(req.body.password);

    if (!user || !matchedPWD) {
      const error = new Error("wrong credentials");
      error.status = "404";
      throw error;
    }

    if (matchedPWD) {
      const token = await createToken({
        id: user._id,
        role: user.role,
      });

      res
        .cookie("access_token", token, cookieOptions)
        .send({ message: "login successful!", user, token });
    }
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find(); //.populate("posts").exec()
    res.send(users);
  } catch (error) {
    next(error);
  }
};

export const getSingleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id); //.populate("records").exec();

    if (!user) {
      const error = new Error("no user found");
      error.status = "404";
      throw error;
    }
    res.send(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    let user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.send({ message: "update successful", user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    const remainingUsers = await User.find();
    res.send({ remainingUsers, deletedUser: user });
  } catch (error) {
    next(error);
  }
};
