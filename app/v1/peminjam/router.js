const router = require('express').Router();
const peminjamController = require('./controller');
const { decodeToken } = require('../../../middleware/authentication');

router.post('/:id_buku', decodeToken, peminjamController.createPinjaman);
router.get(
  '/:id_peminjam/book',
  decodeToken,
  peminjamController.getBukuPinjamanSaya
);
router.put(
  '/return/book/:id_borrowing',
  decodeToken,
  peminjamController.returnBook
);

module.exports = router;
