const Joi = require('joi');

const userSchema = Joi.object({
  firstName: Joi.string().required().max(50).label("First name is required"),
  lastName: Joi.string().required().max(50).label("Last name is required"),
  email: Joi.string().required().email().max(250).label("Email is required"),
  username: Joi.string().required().max(50).label("Username is required"),
  mobileCountryCode: Joi.string().default('+91'),
  mobile: Joi.string().required().max(15).label("Mobile is required"),
  password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
  .message("Password must have at least one uppercase letter, one lowercase letter, one special character, and one number. Minimum length is 8 characters."),
  confirmPassword: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
  .message('Password must have at least one uppercase letter, one lowercase letter, one special character, and one number. Minimum length is 8 characters.'),
  profileImage: Joi.string(),
  role: Joi.string().valid('User', 'Manager', 'Admin').required().label("Role is required"),
  address1: Joi.string().max(100),
  address2: Joi.string().max(100),
  status: Joi.string().valid('Active', 'Inactive').label("Status is required"),
  loginAttempts: Joi.number().default(0),
  lastLoginAttempt: Joi.date().allow(null),
});

const passwordValidation = Joi.object({
  newPassword: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
  .message("Password must have at least one uppercase letter, one lowercase letter, one special character, and one number. Minimum length is 8 characters."),
  confirmPassword: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
  .message('Password must have at least one uppercase letter, one lowercase letter, one special character, and one number. Minimum length is 8 characters.'),
})

module.exports = { userSchema, passwordValidation };
