import { check, validationResult } from "express-validator";

const validateRegistration = [
  check("username")
    .notEmpty()
    .withMessage("First Name is Required")
    .isLength({ min: 3, max: 20 })
    .withMessage("First name must be between 3 and 50 character"),

  check("firstName")
    .notEmpty()
    .withMessage("First Name is Required")
    .isLength({ min: 2, max: 20 })
    .withMessage("First name must be between 2 and 20 character"),

  check("lastName")
    .notEmpty()
    .withMessage("Last Name is Required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Last name must be between 2 and 20 character"),

  check("email")
    .notEmpty()
    .withMessage("Email is Required")
    .isEmail()
    .withMessage("Invalid Email Address"),

  check("age")
    .notEmpty()
    .withMessage("Age is Required")
    .isInt({ min: 18 })
    .withMessage("Age must be at least 18 years"),

  check("password")
    .notEmpty()
    .withMessage("Password is Required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is Required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .custom((value, { req }) => {
      if (value == req.body.password) {
        return true;
      }
      throw new Error("Passwords do not match");
    }),

  (req, res, next) => {
    const results = validationResult(req);

    results.isEmpty() ? next() : res.status(422).send(results.errors);
  },
];

export default validateRegistration;
