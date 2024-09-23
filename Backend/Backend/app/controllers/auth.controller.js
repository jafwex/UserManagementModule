const UserModel = require('../model/user');
const { decryptData } = require('../middlewares/encryption.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const otpGenerator = require('otp-generator');
const otpStore = {};
const authJWT = require('../middlewares/authJWT.js');
const emailConfig = require('../middlewares/emailConfig.js');
const passwordValidation = require('../../validator/validator.js');
const securePassword = require('../middlewares/securePassword.js');

//login route
exports.login = async (req, res) => {
  try {
    const { email } = req.body;
    const password = decryptData(req.body.password);
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).send({ status: 'Failure!', statusCode: 401, message: 'Invalid Email' });
    } else {
      // Check password
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(401).send({ status: 'Failure', statusCode: 401, message: 'Invalid Password' });
      } else {
        const accessToken = jwt.sign({ _id: user._id },
          process.env.SECRET_KEY, {
          expiresIn: '15m', // 15 min
        });
        const refreshToken = jwt.sign({ _id: user._id },
          process.env.SECRET_KEY, {
          expiresIn: '1d', // 1 day 
        });
        const decodedToken = jwt.decode(accessToken);
        const expirationTimestamp = decodedToken.exp;
        authJWT.refreshToken(refreshToken);
        return res.status(200).send({
          statusCode: 200,
          message: "Login Successfully",
          accessToken: accessToken,
          refreshToken: refreshToken,
          expiredAt: expirationTimestamp
        })
      }
    }
  } catch (error) {
    return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
  }
};

// logout user
exports.logout = async (req, res) => {
  try {
    authJWT.invalidateToken(req.token);
    return res.status(200).send({ status: 'Success', statusCode: 200, message: "User Logged Out Successfully" });
  } catch (error) {
    return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
  }
}

exports.refreshToken = async (req, res) => {
  let { refreshToken } = req.body;
  if (!refreshToken)
    return res.sendStatus(401);
  // Verify the refresh token
  jwt.verify(refreshToken, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    } else {
      // Generate a new access token
      const accessToken = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: '15m' });
      res.status(200).send({ accessToken });
    }
  });
}

// send email for forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email: email });
  if (!user) {
    return res.status(403).send({ status: 'Failure', statusCode: 403, message: 'There is no account associated with this email!' });
  } else {
    const transporter = nodemailer.createTransport(emailConfig);
    const emailTemplatePath = path.join(__dirname, '..', '..', 'htmlTemplate', 'emailTemplates', 'verifyOTPTemplate.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');
    const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
    otpStore[email] = otp.toString();
    const emailContent = emailTemplate.replace('{{otp}}', otp);
    const emailSent = await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Reset Password',
      text: 'Reset your password',
      html: emailContent,
    });
    if (emailSent) {
      return res.status(201).send({
        status: 'Password reset email sent.',
        statusCode: 201,
        message: `Password reset link was sent to ${email}`
      });
    } else {
      return res.status(403).send({ status: 'Failure', statusCode: 403, message: 'Password reset failed, Email sending failed!' });
    }
  }
}

//Verify OTP 
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] === otp) {
    return res.status(200).send({ status: 'Success', statusCode: 200, message: 'OTP verified successfully' });
  } else {
    return res.status(400).send({ status: 'Failure', statusCode: 400, message: 'Invalid OTP' });
  }
}

//reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    const newPassword = decryptData(req.body.newPassword);
    const confirmPassword = decryptData(req.body.confirmPassword);
    if (!user) {
      return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'User not found' });
    } else {
      const { error } = passwordValidation.validate({ newPassword: newPassword, confirmPassword: confirmPassword });
      if (error) {
        return res.status(400).send({ status: 'Failure', statusCode: 400, error: error.details[0].message });
      } else {
          if (newPassword !== confirmPassword) {
            return res.status(400).send({ status: 'Failure', statusCode: 400, message: 'New password and confirm password do not match' });
          }
          const hashedNewPassword = await securePassword(newPassword);
          user.password = hashedNewPassword;
          await user.save();
          return res.status(200).send({ status: 'Success', statusCode: 200, message: "Password Reset Successfully!" });
      }
    }
  } catch (error) {
    return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
  }
}

//public access
exports.allAccess = (req, res) => {
  return res.status(200).send({ status: 'Success', statusCode: 200, message: "Public Content!" })
};

//admin access
exports.adminBoard = (req, res) => {
  return res.status(200).send({ status: 'Success', statusCode: 200, message: "Admin Content!" })
};

//manager access
exports.managerBoard = (req, res) => {
  return res.status(200).send({ status: 'Success', statusCode: 200, message: "ManagerBoard Content!" })
};
