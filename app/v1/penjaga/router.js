const router = require('express').Router();
const penjagaController = require('./controller');
const { decodeToken } = require('../../../middleware/authentication');

router.post('/', decodeToken, penjagaController.createPenjaga);
router.get('/request-book', decodeToken, penjagaController.getRequestBook);
router.put(
  '/approve/request-book/:id_borrowing',
  decodeToken,
  penjagaController.approveRequest
);
router.put(
  '/reject/request-book/:id_borrowing',
  decodeToken,
  penjagaController.rejectRequest
);
router.get('/list-borrower', decodeToken, penjagaController.getListBorrower);

router.get(
  '/summary-book-transaction',
  decodeToken,
  penjagaController.getSummaryBookTransaction
);

module.exports = router;
