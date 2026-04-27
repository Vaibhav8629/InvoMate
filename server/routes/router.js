const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const productController = require("../controllers/products-controller");
const profileController = require("../controllers/profile-controller");
const invoiceController = require("../controllers/invoice-controller");
const barcodeController = require("../controllers/barcode-controller");
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");

//public route
router.route("/login").post(authController.login);


//Protected route
router.route("/user").get(authMiddleware,authController.user);
router.route("/register").post(authMiddleware,adminMiddleware,authController.register);
router.route("/getproducts").get(authMiddleware,productController.getMyProducts);
router.route("/addproducts").post(authMiddleware,productController.addProducts);
router.route("/findprofile").get(authMiddleware,profileController.findProfile);
router.route("/createprofile").post(authMiddleware,profileController.createProfile);
router.route("/updateprofile").put(authMiddleware,profileController.updateProfile);
router.route("/updateproduct").put(authMiddleware,productController.updateProduct);
router.route("/deleteproduct/:id").delete(authMiddleware,productController.deleteProduct);
router.post("/saveinvoice",authMiddleware, invoiceController.saveInvoice);
router.route("/getinvoices").get(authMiddleware,invoiceController.getInvoices);
router.get("/product/barcode/:code", authMiddleware, barcodeController.getProductByBarcode);
router.get("/invoice/:id",authMiddleware, invoiceController.getInvoiceById);

module.exports = router;  