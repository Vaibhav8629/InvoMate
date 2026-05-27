const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const productController = require("../controllers/products-controller");
const profileController = require("../controllers/profile-controller");
const invoiceController = require("../controllers/invoice-controller");
const barcodeController = require("../controllers/barcode-controller");
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");
const checkSubscription = require("../middleware/subscription-middleware");

//public route
router.route("/login").post(authController.login);
router.route("/logout").post(authController.logout);
router.route("/test-cookie").get(authController.testCookie); // Test endpoint


//Protected route
router.route("/user").get(authMiddleware, checkSubscription, authController.user);
router.route("/register").post(authMiddleware, adminMiddleware, checkSubscription, authController.register);
router.route("/getproducts").get(authMiddleware, checkSubscription, productController.getMyProducts);
router.route("/addproducts").post(authMiddleware, checkSubscription, productController.addProducts);
router.route("/findprofile").get(authMiddleware, checkSubscription, profileController.findProfile);
router.route("/createprofile").post(authMiddleware, checkSubscription, profileController.createProfile);
router.route("/updateprofile").put(authMiddleware, checkSubscription, profileController.updateProfile);
router.route("/updateproduct").put(authMiddleware, checkSubscription, productController.updateProduct);
router.route("/deleteproduct/:id").delete(authMiddleware, checkSubscription, productController.deleteProduct);
router.post("/saveinvoice", authMiddleware, checkSubscription, invoiceController.saveInvoice);
router.put("/invoice/:id", authMiddleware, checkSubscription, invoiceController.updateInvoice);
router.delete("/invoice/:id", authMiddleware, checkSubscription, invoiceController.deleteInvoice);
router.route("/getinvoices").get(authMiddleware, checkSubscription, invoiceController.getInvoices);
router.get("/product/barcode/:code", authMiddleware, checkSubscription, barcodeController.getProductByBarcode);
router.get("/invoice/:id", authMiddleware, checkSubscription, invoiceController.getInvoiceById);

module.exports = router;