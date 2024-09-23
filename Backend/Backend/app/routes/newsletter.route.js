const express = require('express');
const NewsLetterController = require('../controllers/newsletter.controller');
const router = express.Router();
const authJWT = require('../middlewares/authJWT.js');
const roleAuth = require('../middlewares/roleAuth.js');

router.get('/',  authJWT.verifyToken, roleAuth.isAdmin, NewsLetterController.getAllsubscribeNewsLetter);
router.get('/:id', NewsLetterController.subscribeNewsLetterbyId);
router.post('/subscribe', NewsLetterController.subscribeNewsLetter);
router.delete('/unsubscribe', NewsLetterController.unsubscribeNewsLetter);

module.exports = router;

