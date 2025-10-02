// Controller exports
const authController = require('./authController');
const categoryController = require('./categoryController');
const productController = require('./productController');
const cartController = require('./cartController');
const orderController = require('./orderController');
const addressController = require('./addressController');
const paymentController = require('./paymentController');
const shippingController = require('./shippingController');
const userController = require('./userController');

module.exports = {
  authController,
  categoryController,
  productController,
  cartController,
  orderController,
  addressController,
  paymentController,
  shippingController,
  userController
};
