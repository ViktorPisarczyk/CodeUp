import { createToken } from "../middlewares/jwt.js";
import { User } from "../models/userModel.js";

let cookieOptions = {
  secure: true,
  httpOnly: true,
  sameSite: "Strict",
  maxAge: 3600000,
};

export const signup = async (req, res, next) => {
  console.log(req.body);
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const matchedPWD = await user.auth(password);
    if (!matchedPWD) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = await createToken({ id: user._id, role: user.role });
    res
      .cookie("access_token", token, cookieOptions)
      .send({ message: "Login successful!", user, token });
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logout successful!" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
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
