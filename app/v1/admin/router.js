const router = require('express').Router();
const adminController = require('./controller');
const { decodeToken } = require('../../../middleware/authentication');

router.post('/', decodeToken, adminController.createAdmin);
router.get('/management-user', decodeToken, adminController.getUser);
router.put('/management-user/:id', decodeToken, adminController.updateUserById);
router.delete(
  '/management-user/:id',
  decodeToken,
  adminController.deleteUserById
);

module.exports = router;
