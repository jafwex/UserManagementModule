const express = require('express');
const UserController = require('../controllers/user.controller');
const router = express.Router();
const upload = require('../middlewares/upload.js');
const checkDuplicateusernameoremail = require('../middlewares/checkDuplicateusernameoremail.js');
const authJWT = require('../middlewares/authJWT.js');
const roleAuth = require('../middlewares/roleAuth.js');

router.get('/list', authJWT.verifyToken, roleAuth.isAdmin, UserController.getAllUser);
router.get('/currentUser', authJWT.verifyToken, UserController.currentUser);
router.route('/:id').get(authJWT.verifyToken, roleAuth.isAdmin, UserController.getUserById).put(authJWT.verifyToken, roleAuth.isAdmin, upload, UserController.updateUserbyId);
router.post('/', authJWT.verifyToken, roleAuth.isAdmin, upload, checkDuplicateusernameoremail.checkDuplicate, UserController.createUser);
router.patch('/status/:id', authJWT.verifyToken, roleAuth.isAdmin, UserController.updateStatusUser);
router.delete('/:id', authJWT.verifyToken, roleAuth.isAdmin, UserController.deleteUser);
router.delete('/image/:id', authJWT.verifyToken, roleAuth.isAdmin, UserController.deleteImage);
router.post('/changepassword', authJWT.verifyToken, UserController.changePassword);
router.post('/encrypt', UserController.encrypt);
router.post('/decrypt', UserController.decrypt);

module.exports = router;
