const app = require("express");
const router = app.Router();

const openP = require('../controllers/openP.c');

router.get('/', openP.getOpen);
router.post('/', openP.postOpen);

module.exports = router;