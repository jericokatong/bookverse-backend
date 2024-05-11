const express = require('express');
const router = express.Router();
const authenticationController = require('./controller');

router.post('/register/peminjam', authenticationController.registerPeminjam);
router.post('/login/peminjam', authenticationController.loginPeminjam);
router.post('/login/penjaga', authenticationController.loginPenjaga);
router.post('/login/admin', authenticationController.loginAdmin);
router.put('/', authenticationController.updateAccessToken);
router.post('/logout', authenticationController.logout);

module.exports = router;
