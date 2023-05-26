const router = require("express").Router();
const middlewareController = require("../controllers/middlewareController");
const fileController = require("../controllers/fileController");

//CREATE A POST
router.post(
  "/image-upload",
  middlewareController.verifyToken,
  fileController.imageUpload
);

module.exports = router;
