import { createToken } from '../middlewares/jwt.js';
import { User } from '../models/userModel.js';

let cookieOptions = {
  secure: false,
  httpOnly: true,
  sameSite: true,
  maxAge: 100 * 365.25 * 24 * 60 * 60 * 1000, // 100 years,
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate('records').exec();
    res.send(users);
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
export const updateUser = async (req, res, next) => {
  try {
    let user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.send({ message: 'update successful', user });
  } catch (error) {
    next(error);
  }
};
export const signup = async (req, res, next) => {
  try {
    const { name, email, password, role, records } = req.body;
    const newUser = await User.create({ name, email, password, role, records });

    const token = await createToken({ id: newUser._id, role: newUser.role });

    res.cookie('access_token', token, cookieOptions).send({ newUser, token });
  } catch (error) {
    next(error);
  }
};
export const getSingleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('records').exec();
    //const user = await User.findOne({_id:req.params.id});

    if (!user) {
      const error = new Error('no user found');
      error.status = '404';
      throw error;
    }
    res.send(user);
  } catch (error) {
    next(error);
  }
};
export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    const matchedPWD = await user.auth(req.body.password);

    // if(!user || !(user.password===req.body.password)){
    if (!user || !matchedPWD) {
      const error = new Error('wrong credentials');
      error.status = '404';
      throw error;
    }

    if (matchedPWD) {
      const token = await createToken({
        id: user._id,
        role: user.role,
      });

      res
        .cookie('access_token', token, cookieOptions)
        .send({ message: 'login successful!', user, token });
    }
  } catch (error) {
    next(error);
  }
};
