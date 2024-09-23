const express = require('express');
const AuthController = require('../controllers/auth.controller.js');
const router = express.Router();
const authJWT = require('../middlewares/authJWT.js');
const roleAuth = require('../middlewares/roleAuth.js');

router.post('/login', AuthController.login);
router.post('/logout', authJWT.verifyToken, AuthController.logout);
router.post('/token/refreshToken', AuthController.refreshToken);
router.post('/forgotpassword', AuthController.forgotPassword);
router.post('/resetpassword', AuthController.resetPassword);
router.post('/verifyOTP', AuthController.verifyOTP);
router.get('/manager', authJWT.verifyToken, roleAuth.isManager, AuthController.managerBoard);
router.get('/admin', authJWT.verifyToken, roleAuth.isAdmin, AuthController.adminBoard);

module.exports = router;
