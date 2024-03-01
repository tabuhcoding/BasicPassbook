const Passbook = require('../models/passbook.m');
const demand_book = require('../models/demand_book.m');
const term_saving_book = require('../models/term_saving_book.m');
const calH = require('../helper/calculatorBalance.h');
const currentDateH = require('../helper/getCurrentDate.h');
const serviceM = require('../models/service.m');
const regular = require('../models/regulation.m');

module.exports = {
    getWithdrawal: async (req, res, next) => {
        try {
            res.render('servicePage/makeWithdrawal');
        } catch (error) {
            return new Error('Error get login');
        };
    },
    postWithdrawal: async (req, res, next) => {
        try {
            const data = req.body;
            const pb = await Passbook.getByID(data.passbookID);
            const date = currentDateH.getCurrentDateWithoutTime();
            
            if(!pb){
                return res.send("passbook khong ton tai");
            }
            if(pb.customer_ID != data.customerID){
                console.log(pb.customer_ID + " " + data.customerID);
                return res.send("Khong dung chu so");
            }
            if(pb.status == false){
                return res.send("So da dong");
            }
            if(pb.type === 'Demand'){
                const demandBook = await demand_book.getByID(data.passbookID);
                const nowBalance = calH.calculateDemandBook(demandBook,date);
                //HANDLE THEM O DAY
                const startDate = new Date(demandBook.start_date);
                const currentDate = new Date();
                console.log(startDate + " " + currentDate);
                const timeDifference = currentDate.getTime() - startDate.getTime();
                const daysDifference = timeDifference / (1000 * 3600 * 24); // Chuyển đổi milliseconds thành ngày
                console.log(daysDifference);
                console.log
                if (daysDifference < regular.getMinToWithdrawal()) {
                    return res.send("So chua du thoi gian toi thieu de rut");
                }
                let newBalance, amount, type;
                if(parseInt(data.amount) > (nowBalance - 100)){
                    newBalance = 0;
                    amount = nowBalance;
                    type = 'Withdraw ALL';
                    const rsDeactive = await Passbook.deactivePassbook(data.passbookID);
                }
                else{
                    newBalance = nowBalance - parseInt(data.amount);
                    amount = parseInt(data.amount);
                    type = "Withdrawal";
                }
                const withdrawalInfo = {
                    newBalance: newBalance,
                    passbookID: data.passbookID,
                    date: date,
                }
                const rsWD = await serviceM.makeWidthDrawalForDemand(withdrawalInfo);
                if(!rsWD){
                    return res.send("Error make withdraw");
                }
                const serviceInfo = {
                    passbook_id: data.passbookID,
                    date: date,
                    type: type,
                    amount: amount
                }
                const rsAddS = await serviceM.addService(serviceInfo);
                if(!rsAddS){
                    return res.send("Error add service");
                };
            }
            else{
                const termBook = await term_saving_book.getByID(data.passbookID);
                const termMatch = pb.type.match(/\d+/);
                const term = termMatch ? parseInt(termMatch[0]) : 0;
                const daysDiff = Math.ceil((new Date(date) - termBook.start_date) / (1000 * 60 * 60 * 24)); 
                if(daysDiff < term * 30){
                    return res.send("Before the account matures.");
                }
                const nowBalance = await calH.calculateTSB(termBook,date, pb.type);
                const withdrawalInfo = {
                    passbookID: data.passbookID,
                    date: date,
                }
                const rsWD = await serviceM.makeWidthDrawalForTerm(withdrawalInfo);
                if(!rsWD){
                    return res.send("Error make withdraw");
                }
                const serviceInfo = {
                    passbook_id: data.passbookID,
                    date: date,
                    type: "Withdraw ALL",
                    amount: nowBalance
                }
                const rsAddS = await serviceM.addService(serviceInfo);
                if(!rsAddS){
                    return res.send("Error add service");
                };
            }
            return res.redirect('/');
        } catch (error) {
            return new Error('Error get login');
        };
    },
}