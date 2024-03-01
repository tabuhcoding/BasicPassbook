const app = require("express");
const router = app.Router();

const withdraw = require('../controllers/withdrawal.c');
const deposit = require('../controllers/deposit.c');

router.get('/makeWithdrawal', withdraw.getWithdrawal);
router.get('/makeDeposit', deposit.getDeposit);
router.post('/makeDeposit', deposit.postDeposit);
router.post('/makeWithdrawal', withdraw.postWithdrawal);

module.exports = router;