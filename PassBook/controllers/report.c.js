const serviceM = require('../models/service.m');
const demandM = require('../models/demand_book.m');
const termM = require('../models/term_saving_book.m');
const passbookM = require("../models/passbook.m");
const termDB = require('../helper/json.h');
module.exports = {
    getReport: async (req, res, next) => {
        try {
            res.render('reportPage/makeReport');
        } catch (error) {
            return new Error('Error get login');
        };
    },
    getDailyReport: async (req, res, next) => {
        try {
            res.render('reportPage/makeDailyReport');
        } catch (error) {
            return new Error('Error get login');
        };
    },
    getMonthlyReport: async (req, res, next) => {
        try {
            const termData = await termDB.getTerm();
            res.render('reportPage/makeMonthlyReport',{
                termData: termData,
            });
        } catch (error) {
            return new Error('Error get login');
        };
    },
    postDailyReport: async (req, res, next) => {
        try {
            const date = req.body.date;
            const data = await serviceM.getAllServiceByDay(date);
            
            if(data.length === 0) {
                return res.render('reportPage/resultDailyReport', {
                    date: date,
                    dailyReport: [],
                });
            }

            const dailyReport = [];

            // filter type of passbook such as demand book or term book
            // (term book maybe 3 months, 6 months and can be added more so cannot filtered by hard data)
            const demandBooks = [];
            const termBooks = [];
            for(let i = 0; i < data.length; i++){
                
                const type = await passbookM.getTypeOfPassbook(data[i].passbookID);
                if(type === 'Demand'){
                    demandBooks.push(data[i]);
                }
                else{
                    termBooks.push(data[i]);
                }
            }

            const typeList = [];
            if(demandBooks.length > 0) {
                for(let i = 0; i < demandBooks.length; i++) {
                    const type = await passbookM.getTypeOfPassbook(demandBooks[i].passbookID);
                    if(!typeList.includes(type)){
                        typeList.push(type);
                    }
                }
            }
            if(termBooks.length > 0) {
                for(let i = 0; i < termBooks.length; i++) {
                    const type = await passbookM.getTypeOfPassbook(termBooks[i].passbookID);
                    if(!typeList.includes(type)){
                        typeList.push(type);
                    }
                }
            }

            for(let i = 0; i < typeList.length; i++) {
                const type = typeList[i];
                const passbookList = await passbookM.getByType(type); // demand / 3 months / 6 months /...
                const depositList = await serviceM.getAllDepositByDay(date);
                const withdrawalList = await serviceM.getAllWithdrawalByDay(date);

                // calc total deposit books contained in passbookList
                let totalDeposit = 0;
                for(let j = 0; j < depositList.length; j++){
                    const passbookID = depositList[j].passbookID;
                    // check if in passbookList contains passbook that has passbookID
                    const index = passbookList.findIndex(passbook => passbook.passbook_ID === passbookID);
                    if(index !== -1){
                        totalDeposit += depositList[j].amount;
                    }
                }

                // calc total withdrawal books contained in passbookList
                let totalWithdrawal = 0;
                for(let j = 0; j < withdrawalList.length; j++){
                    const passbookID = withdrawalList[j].passbookID;
                    // check if in passbookList contains passbook that has passbookID
                    const index = passbookList.findIndex(passbook => passbook.passbook_ID === passbookID);
                    if(index !== -1){
                        totalWithdrawal += withdrawalList[j].amount;
                    }
                }
                
                const diff = totalDeposit - totalWithdrawal;
                
                dailyReport.push({
                    type: type,
                    revenue: totalDeposit,
                    expense: totalWithdrawal,
                    difference: diff
                });
            }

            console.log(date);

            res.render('reportPage/resultDailyReport', {
                date: date,
                dailyReport: dailyReport,
            });
        } catch (error) {
            res.render('reportPage/resultDailyReport', {
                date: date,
                dailyReport: [],
            });
            return new Error('Error post daily report');
        }
    },
    postMonthlyReport: async (req, res, next) => {
        try {
            const monthGet = req.body.month;
            const monthNames = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ];
        
            const [monthTmp, year] = monthGet.split('-');
            const monthIndex = monthNames.findIndex(name => name === monthTmp);
            
            if (monthIndex !== -1) {
                
                const formattedMonth = (monthIndex + 1).toString().padStart(2, '0');
                month = `${formattedMonth}-${year}`;
            }
            else {
                month = req.body.month;
            }

            const type = req.body.type;

            open = await passbookM.getByTypeAndMonth(month, type);
            let openDate = [];
            for (let i = 0; i< open.length; i++){
                const date = new Date(open[i].open_date);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Thêm '0' vào trước nếu tháng có một chữ số
                const day = String(date.getDate()).padStart(2, '0'); // Thêm '0' vào trước nếu ngày có một chữ số
                openDate.push(`${year}-${month}-${day}`);
            }                    
            let monthlyReport = [];
            for (let i = 0; i < openDate.length; i++){
                let cnt = 1;
                for (let j = i + 1; j < openDate.length; j++){
                    if (openDate[i] == openDate[j]) {
                        cnt++;
                        openDate[j] = openDate[j+1];
                        openDate.length--;
                    }
                }
                monthlyReport.push({
                    date: openDate[i],
                    open: cnt,
                    close: 0,
                    diff: cnt,
                })
            }

            const close = await serviceM.getAllWithdrawalAllByMonthAndType(month, type);
            let closeDate = [];
            for (let i = 0; i< close.length; i++){
                const date = new Date(close[i].date);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Thêm '0' vào trước nếu tháng có một chữ số
                const day = String(date.getDate()).padStart(2, '0'); // Thêm '0' vào trước nếu ngày có một chữ số
                closeDate.push(`${year}-${month}-${day}`);
            }        

            let closes = [];
            for (let i = 0; i < closeDate.length; i++){
                let cnt = 1;
                for (let j = i + 1; j < closeDate.length; j++){
                    if (closeDate[i] == closeDate[j]) {
                        cnt++;
                        closeDate[j] = closeDate[j+1];
                        closeDate.length--;
                    }
                }
                closes.push({
                    date: closeDate[i],
                    open: 0,
                    close: cnt,
                    diff: cnt,
                })
            }

            closes.forEach(item => {
                let existingItem = monthlyReport.find(item1 => item1.date === item.date);
                if (existingItem) {
                    existingItem.close = item.close;
                } else {
                    monthlyReport.push({ date: item.date, open: 0, close: item.close, diff: item.close });
                }
            });
            for (let i = 0; i < monthlyReport.length; i++){
                let diff = Math.abs(monthlyReport[i].open - monthlyReport[i].close);
                monthlyReport[i].diff = diff;
            }
            monthlyReport.sort((a, b) => {
                return new Date(a.date) - new Date(b.date);
            });
            
            res.render('reportPage/resultMonthlyReport', {
                month: month,
                type: type,
                monthlyReport: monthlyReport,
            });
        } catch (error) {
            return new Error('Error post montly report');
        }
    }
}