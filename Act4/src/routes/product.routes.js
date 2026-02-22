const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const productController = require('../controllers/product.controller');

router.use(authMiddleware);

router.post('/', productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;