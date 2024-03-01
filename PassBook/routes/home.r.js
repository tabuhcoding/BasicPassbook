const app = require("express");
const router = app.Router();

const homeS = require('../controllers/search.c');
// const importData = require('../controllers/home.c')

router.get('/', homeS.home);
router.get('/searchPassbook', homeS.searchPassbook);
router.post('/importData', homeS.postImport);
router.post('/searchPassbook', homeS.postSearchPassbook);

module.exports = router;