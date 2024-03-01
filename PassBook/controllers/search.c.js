const importData = require('../models/importData');
const passbookM = require('../models/passbook.m');
const curH = require('../helper/getCurrentDate.h');
const customerM = require('../models/customer.m');
const regulationM = require('../models/regulation.m');

module.exports = {
    home: async (req, res, next) => {
        try {
            res.render('home');
        } catch (error) {
            return new Error('Error get login');
        };
    },
    searchPassbook: async (req,res,next) => {
        try {
            var passbooks = await passbookM.getAll();
            const date = curH.getCurrentDateWithoutTime();
            for (let passbook of passbooks) {
                if (passbook.status) {
                //   const date = getCurrentDateWithoutTime();
                  passbook.balance = await passbookM.getBalance(passbook.passbook_ID, date);
                } else {
                  passbook.balance = 0;
                }
                // console.log(passbook.date);
                const dateObj = new Date(passbook.open_date);

                const year = dateObj.getFullYear(); // Lấy năm hiện tại
                const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Lấy tháng hiện tại và thêm số 0 phía trước nếu cần
                const day = String(dateObj.getDate()).padStart(2, '0'); // Lấy ngày hiện tại và thêm số 0 phía trước nếu cần
                passbook.formattedDate = `${year}-${month}-${day}`;
            }
            const type = regulationM.getAllType();
            return res.render('searchPage/searchPassbook', {
                passbooks: passbooks,
                types: type,
            });
        } catch (error) {
            return new Error('Error get login');
        };
    },
    postImport: async (req, res, next) => {
        try {
            const rs = await importData.importDataFromCSV();
            res.send(rs);
        } catch (error) {
            return new Error('Error get login');
        };
    },
    postSearchPassbook: async (req, res, next) => {
        try {
            const date = curH.getCurrentDateWithoutTime();

            console.log(req.body);
            const data = req.body;
            var typeFilter;
            if(data.term == "All"){
                typeFilter = "";
            }else{
                typeFilter = data.term;
            }
            const id = req.body.customerID;
            const cus = await customerM.findCustomer(id);
            // if(!cus){
            //     return res.send("Customer khong ton tai");
            // }
            const searchFilter = {
                passbook_id: data.passbookID,
                customer_id: data.customerID,
                type: typeFilter,
                defaultMonth: data.defaultMonth,
            }
            const type = regulationM.getAllType();
            var passbooks = await passbookM.getByFilter(searchFilter);
            if(passbooks.length == 0){
                return res.render('searchPage/searchPassbook', {
                    cus: cus,
                    passbooks: passbooks,
                    message: "No result",
                    customerID: data.customerID,
                    passbookID: data.passbookID,
                    defaultMonth: data.defaultMonth,
                    types: type,
                    term: data.term,
                    balanceRange: data.balanceRange,
                    sortBy: data.sortBy
                });
            }
            for (let passbook of passbooks) {
                if (passbook.status) {
                //   const date = getCurrentDateWithoutTime();
                  passbook.balance = await passbookM.getBalance(passbook.passbook_ID, date);
                } else {
                  passbook.balance = 0;
                }
                // console.log(passbook.date);
                const dateObj = new Date(passbook.open_date);

                const year = dateObj.getFullYear(); // Lấy năm hiện tại
                const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Lấy tháng hiện tại và thêm số 0 phía trước nếu cần
                const day = String(dateObj.getDate()).padStart(2, '0'); // Lấy ngày hiện tại và thêm số 0 phía trước nếu cần
                passbook.formattedDate = `${year}-${month}-${day}`;
            }
            // Sort passbooks based on sortBy value
            const sortBy = parseInt(data.sortBy);
            if (sortBy === 1) {
                passbooks.sort((a, b) => a.customer_ID.localeCompare(b.customer_ID));
            } else if (sortBy === 2) {
                passbooks.sort((a, b) => a.open_date.localeCompare(b.open_date));
            } else if (sortBy === 3) {
                passbooks.sort((a, b) => a.balance - b.balance);
            } else {
                passbooks.sort((a, b) => a.passbook_ID.localeCompare(b.passbook_ID));
            }

            // Filter passbooks based on balanceRange value
            const balanceRange = parseInt(data.balanceRange);
            if (balanceRange === 1) {
                passbooks = passbooks.filter((passbook) => passbook.balance >= 0 && passbook.balance <= 1000);
            } else if (balanceRange === 2) {
                passbooks = passbooks.filter((passbook) => passbook.balance > 1000 && passbook.balance <= 50000);
            } else if (balanceRange === 3) {
                passbooks = passbooks.filter((passbook) => passbook.balance > 50000 && passbook.balance <= 500000);
            } else if (balanceRange === 4) {
                passbooks = passbooks.filter((passbook) => passbook.balance > 500000);
            }
            return res.render('searchPage/searchPassbook', {
                Cus: cus,
                passbooks: passbooks,
                types: type,
                customerID: data.customerID,
                passbookID: data.passbookID,
                defaultMonth: data.defaultMonth,
                term: data.term,
                balanceRange: data.balanceRange,
                sortBy: data.sortBy
            });
        } catch (error) {
            return new Error('Error get login');
        };
    },
}