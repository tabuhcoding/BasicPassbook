const serviceM = require('../models/service.m');
const regular = require('../models/regulation.m');
const demand_book = require('../models/demand_book.m');
const currentDateH = require('../helper/getCurrentDate.h');
const Passbook = require('../models/passbook.m');
module.exports = {
    getDeposit: async (req, res, next) => {
        try {
            res.render('servicePage/makeDeposit');
        } catch (error) {
            return new Error('Error get login');
        };
    },
    postDeposit:  async (req, res, next) => {
        try {
            const data = req.body;
            if(!data.amount || !data.passbookID || !data.customerID){
                return res.send("Please fill all the fields");
            }
            if(data.amount < 100){
                return res.send("Deposit amount must be >= 100");
            }
            const book = await demand_book.getByID(data.passbookID);
            if(!book){
                return res.send("Passbook must be Demand_book");
            }
            const pb = await Passbook.getByID(data.passbookID);
            console.log(pb.customer_ID + " " + data.customerID);
            if(pb.customer_ID != data.customerID){
                return res.send("Khong dung chu so");
            }
            const depositInfo = {
                amount: parseInt(data.amount),
                date: currentDateH.getCurrentDateWithoutTime(),
                passbookID: data.passbookID,
            }
            const rsDeposit = await serviceM.makeDeposit(depositInfo);
            if(!rsDeposit){
                return res.send("Error make deposit");
            }
            const serviceInfo = {
                passbook_id: data.passbookID,
                date: currentDateH.getCurrentDateWithoutTime(), 
                type: 'Deposit', 
                amount: parseInt(data.amount),
            }
            const rsAddSer = await serviceM.addService(serviceInfo);
            if(!rsAddSer){
                return res.send("Error add service");
            };
            res.redirect('/');
        } catch (error) {
            return res.send(error);
        };
    },
}