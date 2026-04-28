const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { checkPermission } = require("../middleware/checkPermission");
const {
  getProjectsByInternship,
  createProjectTemplate,
  updateProjectTemplate,
  deleteProjectTemplate,
} = require("../controllers/internshipProjectController");

router.use(protect);

router.get("/", getProjectsByInternship);
router.post(
  "/",
  checkPermission("internBatches.create"),
  createProjectTemplate,
);
router.put(
  "/:id",
  checkPermission("internBatches.edit"),
  updateProjectTemplate,
);
router.delete(
  "/:id",
  checkPermission("internBatches.delete"),
  deleteProjectTemplate,
);

module.exports = router;
