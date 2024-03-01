const importData = require('../models/importData');
const passbookM = require('../models/passbook.m');
const customerM = require('../models/customer.m');
const demandM = require('../models/demand_book.m');
const termM = require('../models/term_saving_book.m');
const termDB = require('../helper/json.h');
const regulationM = require('../models/regulation.m');

module.exports = {
    getOpen: async (req, res, next) => {
        try {
            const termData = await termDB.getTerm();
            res.render('openPage/openPassbook',{
                termData: termData,
            });
        } catch (error) {
            return new Error('Error get open');
        };
    },

    postOpen: async (req, res, next) => {
        try {
            const termData = await termDB.getTerm();
            const inputData = req.body;
            const passbookID = inputData.passbookID;
            const type = inputData.term;
            const cusFullname = inputData.fullname;
            const cusID = inputData.customerID;
            const address = inputData.address;
            const money = inputData.amount;
            // handle if not input any field
            if(!passbookID || !type || !cusFullname || !cusID || !address || !money) {
                return res.render('openPage/openPassbook', {
                    termData: termData,
                    errorMessage: 'Please input all field'
                });
            }

            // check if money < min deposit
            const minDeposit = regulationM.getMinDeposit();
            if(money < minDeposit) {
                return res.render('openPage/openPassbook', {
                    termData: termData,
                    errorMessage: 'Money must be greater than minimum deposit'
                });
            }

            // check if exists passbook have same id
            const passbook = await passbookM.getByID(passbookID);
            if(passbook) {
                return res.render('openPage/openPassbook', {
                    termData: termData,
                    errorMessage: 'Passbook is exist, please enter again!'
                });
            }
            const date = new Date();
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0, cần cộng thêm 1
            const day = date.getDate().toString().padStart(2, '0'); // Lấy ngày và thêm '0' nếu ngày < 10
            const formattedDate = `${year}-${month}-${day}`;
            const passbookInfo = {
                passbook_id: passbookID,
                customerInfor: {
                    id: cusID,
                    name: cusFullname, 
                    phone: '',
                    address: address,
                    identityNumber: ''
                },
                date: formattedDate,
                type: type,
                balance: money
            };
            console.log(passbookInfo);
            const rs = await passbookM.addPassbook(passbookInfo);
            if(!rs) {
                return res.render('openPage/openPassbook', {
                    termData: termData,
                    errorMessage: 'Failed to add passbook'
                });
            }
            res.send('Success to add passbook')
            // req.flash('success', 'Added passbook successfully.');
            // res.redirect('/');
        } catch (error) {
            next("Error post open: ", error);
            return new Error('Error post open');
        }
    }
}