const regulationM = require('../models/regulation.m');
const regulationJSON = require('../Utils/regulation.json');
const termDB = require('../helper/json.h');
const jsonH = require('../helper/json.h');
const { parse } = require('dotenv');

module.exports = {
    getRegulation: async (req, res, next) => {
        try {
            res.render('regulationPage/changeRegulation');
        } catch (error) {
            return new Error('Error get login');
        };
    },
    getChangeNumberTermTypes: async (req, res, next) => {
        try {
            let types = regulationM.getAllType();
            types = types.filter(type => type !== "All" && type !== "Demand");
            res.render('regulationPage/changeNumberTermTypes', {types: types});
        } catch (error) {
            return new Error('Error get login');
        };
    },
    getChangeTermInfor: async (req, res, next) => {
        try {
            const termData = await termDB.getTerm();
            let types = regulationM.getAllType();
            types = types.filter(type => type !== "All");
            res.render('regulationPage/changeTermInfor',{
                termData: types,
            });
        } catch (error) {
            return new Error('Error get login');
        };
    },
    postChangeTermInfor: async (req, res, next) => {
        try {
            let types = regulationM.getAllType();
            types = types.filter(type => type !== "All");
            const term = req.body.term;
            const newMinDeposit = req.body.minimumDeposit;
            const newMinTime = req.body.minimumTime;
            const newRate = req.body.interestRate;

            if(newMinDeposit === "" && newMinTime === "" && newRate === "") {
                return res.render('regulationPage/changeTermInfor', {
                    termData: types,
                });
            }

            if(newMinDeposit < 0 || newMinTime < 0 || newRate < 0) {
                return res.render('regulationPage/changeTermInfor', {
                    termData: types,
                    errorMessage: 'Updated value must be a positive number!'
                });
            }

            const data = jsonH.getAll();
            const newDate = new Date();
            const year = newDate.getFullYear();
            const month = newDate.getMonth() + 1; // Tháng bắt đầu từ 0, cần cộng thêm 1
            const day = newDate.getDate();
            const formattedDate = `${year}-${month}-${day}`;

            if(newMinDeposit !== "") {
                if (parseInt(newMinDeposit) > 0 ){
                    data.REGULATION.MIN_DEPOSIT_LAST = data.REGULATION.MIN_DEPOSIT;
                    data.REGULATION.MIN_DEPOSIT = parseInt(newMinDeposit);
                    // i want data.REGULATION.MIN_DEPOSIT_LAST equal to current date 
                    data.REGULATION.MIN_DEPOSIT_LAST_DATE = formattedDate;
                }
                else throw(error);
            }
            if(newMinTime !== "") {
                if (parseInt(newMinTime) > 0) {
                    data.REGULATION.MIN_TO_WITHDRAWAL_LAST = data.REGULATION.MIN_TO_WITHDRAWAL;
                    data.REGULATION.MIN_TO_WITHDRAWAL = parseInt(newMinTime);
                    data.REGULATION.MIN_TO_WITHDRAWAL_LAST_DATE = formattedDate;
                }
                else throw(error);
            }
            if(term === "Demand") {
                if (parseFloat(newRate) > 0){
                    data.REGULATION.DEMAND_LASTRATE = data.REGULATION.DEMAND_RATE;
                    data.REGULATION.DEMAND_RATE = parseFloat(newRate);
                    data.REGULATION.DEMAND_LASTRATEDATE = formattedDate;
                }
                else throw(error);
            }
            else {
                if (parseFloat(newRate) > 0){
                    const index = data.REGULATION.TERM.findIndex(item => item.TERMS === term);
                    data.REGULATION.TERM[index].LASTRATE = data.REGULATION.TERM[index].RATE;
                    data.REGULATION.TERM[index].RATE = parseFloat(newRate);
                    data.REGULATION.TERM[index].LASTRATEDATE = formattedDate;
                }
                else throw error;
            }
            jsonH.update(data);
            res.render('regulationPage/changeTermInfor',{
                termData: types,
            });
        } catch (error) {
            return new Error('Error get login');
        }
    },
    postAddNewTerm: async (req, res, next) => {
        try {
            const data = req.body;
            let types = regulationM.getAllType();
            types = types.filter(type => type !== "All" && type !== "Demand");
            const term = data.newTerm;
            const regex = /^\d+ months$/;

            if(data.interestRate <= 0) return res.render('regulationPage/changeNumberTermTypes', {
                types: types,
                addMessage: `interestRate must be a positive number`
            });
            
            if(!regex.test(term)){
                return res.render('regulationPage/changeNumberTermTypes', 
                {types: types, 
                    addMessage: `please inputType: numberofmonth + months, Ex: "3 months"`})
            };
            if (types.includes(term)) {
                return res.render('regulationPage/changeNumberTermTypes', 
                {types: types,
                    addMessage: `Term da ton tai`
                });
            }
            const addRs = regulationM.addNewTerm(term, data.interestRate);
            types = regulationM.getAllType();
            types = types.filter(type => type !== "All" && type !== "Demand");
            return res.render('regulationPage/changeNumberTermTypes', 
            {types: types,
                addMessage: `Add success`
            });
        } catch (error) {
            return new Error('Error get login');
        };
    },
    postRemoveOneTerm: async (req, res, next) => {
        try {
            const data = req.body;
            
            const removeRs = await regulationM.deleteTerm(data.deleteTerm);
            let types = regulationM.getAllType();
            types = types.filter(type => type !== "All" && type !== "Demand");
            if(removeRs){
                return res.render('regulationPage/changeNumberTermTypes', 
                {types: types,
                removeMessage: "remove success"
                });
            }
            else return res.render('regulationPage/changeNumberTermTypes', 
            {types: types,
                removeMessage: "remove error"
            });
        } catch (error) {
            return new Error('Error get login');
        };
    },
}