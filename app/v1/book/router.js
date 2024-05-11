const router = require('express').Router();
const bookController = require('./controller');
const { decodeToken } = require('../../../middleware/authentication');

router.post('/', decodeToken, bookController.createBook);
router.get('/', decodeToken, bookController.getBook);
router.put('/:id', decodeToken, bookController.updateBook);
router.delete('/:id', decodeToken, bookController.deleteBook);

module.exports = router;
