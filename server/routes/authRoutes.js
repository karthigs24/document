const express = require('express');
const { register, login, verifyFirebaseToken } = require('../controllers/authController');
const { authenticateJwt } = require('../middleware/authMiddleware');
const { checkRole } = require('../utils/roleCheck');
const passport = require('passport');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/');
});

router.use(verifyFirebaseToken);

router.get('/admin', authenticateJwt, checkRole('admin', 'readAny'), (req, res) => {
    res.send('Admin Access');
});

router.get('/profile', authenticateJwt, checkRole('user', 'readOwn'), (req, res) => {
    res.send('User Profile');
});

module.exports = router;
