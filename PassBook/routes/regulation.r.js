const app = require("express");
const router = app.Router();

const regulation = require('../controllers/regulation.c');

router.get('/', regulation.getRegulation);
router.get('/number-term-types', regulation.getChangeNumberTermTypes);
router.get('/term-information', regulation.getChangeTermInfor);
router.post('/addTerm', regulation.postAddNewTerm);
router.post('/removeTerm', regulation.postRemoveOneTerm);
router.post('/term-information', regulation.postChangeTermInfor);

module.exports = router;