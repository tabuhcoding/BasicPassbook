const db = require ('../Utils/db');
const DemandBook = require('./demand_book.m');
const calH = require('../helper/calculatorBalance.h');

module.exports = class Service{
    constructor(obj){
        this.serviceID = obj.service_id;
        this.passbookID= obj.passbook_id;
        this.date = obj.date;
        this.type = obj.type;
        this.amount = obj.amount;
    }
    static async getAllDepositByMonth(month){
        try {
            // Phân tích tháng và năm từ chuỗi đầu vào
            const [inputYear, inputMonth] = month.split('-');

            // Sử dụng truy vấn SQL với điều kiện type='Deposit' và phân tích tháng và năm từ cột date để so sánh với tháng và năm được chỉ định
            const data = await db.execute(`
                SELECT * 
                FROM "services" 
                WHERE 
                    "type" = 'Deposit' 
                    AND 
                    DATE_PART('year', "date") = ${inputYear} 
                    AND 
                    DATE_PART('month', "date") = ${inputMonth}
            `);
            return data.map((p) => {
                return new Service(p);
            })
        } catch (error) {
            return new Error('Error get all deposit by month');
        };
    }
    static async getAllWithdrawalByMonth(month){
        try {
            // Phân tích tháng và năm từ chuỗi đầu vào
            const [inputYear, inputMonth] = month.split('-');

            // Sử dụng truy vấn SQL với điều kiện type='Deposit' và phân tích tháng và năm từ cột date để so sánh với tháng và năm được chỉ định
            const data = await db.execute(`
                SELECT * 
                FROM "services" 
                WHERE 
                    "type" = 'Withdrawal' 
                    AND 
                    DATE_PART('year', "date") = ${inputYear} 
                    AND 
                    DATE_PART('month', "date") = ${inputMonth}
            `);
            return data.map((p) => {
                return new Service(p);
            })
        } catch (error) {
            return new Error('Error get all withdrawal by month');
        };
    }
    static async getAllWithdrawalAllByMonth(month){
        try {
            // Phân tích tháng và năm từ chuỗi đầu vào
            const [inputYear, inputMonth] = month.split('-');

            // Sử dụng truy vấn SQL với điều kiện type='Deposit' và phân tích tháng và năm từ cột date để so sánh với tháng và năm được chỉ định
            const data = await db.execute(`
                SELECT * 
                FROM "services" 
                WHERE 
                    "type" = 'Withdraw ALL' 
                    AND 
                    DATE_PART('year', "date") = ${inputYear} 
                    AND 
                    DATE_PART('month', "date") = ${inputMonth}
            `);
            return data.map((p) => {
                return new Service(p);
            })
        } catch (error) {
            return new Error('Error get all withdrawal-all by month');
        };
    }
    static async getAllWithdrawalAllByMonthAndType(month, type){
        try {
            // Phân tích tháng và năm từ chuỗi đầu vào
            const [inputYear, inputMonth] = month.split('-');

            // Sử dụng truy vấn SQL với điều kiện type='Deposit' và phân tích tháng và năm từ cột date để so sánh với tháng và năm được chỉ định
            const data = await db.execute(`
            SELECT s."service_id", s."passbook_id", TO_CHAR(s."date", 'YYYY-MM-DD') AS date, s."type", s."amount"
            FROM "services" s
                JOIN "passbooks" p ON s."passbook_id" = p."passbook_id" AND p."type" = '${type}'
                WHERE 
                    s."type" = 'Withdraw ALL' 
                    AND DATE_PART('year', s."date") = ${inputYear}
                    AND DATE_PART('month', s."date") = ${inputMonth}
                `);
            return data.map((p) => {
                return new Service(p);
            })
        } catch (error) {
            return new Error('Error get all withdrawal-all by month');
        };
    }
    static async getAllDepositByDay(day) {
        try {
            // Phân tích tháng và năm từ chuỗi đầu vào
            const [inputYear, inputMonth, inputDay] = day.split('-');

            // Sử dụng truy vấn SQL với điều kiện type='Deposit' và phân tích tháng và năm từ cột date để so sánh với tháng và năm được chỉ định
            const data = await db.execute(`
                SELECT * 
                FROM "services" 
                WHERE 
                    "type" = 'Deposit' 
                    AND 
                    DATE_PART('year', "date") = ${inputYear} 
                    AND 
                    DATE_PART('month', "date") = ${inputMonth}
                    AND
                    DATE_PART('day', "date") = ${inputDay}
            `);
            return data.map((p) => {
                return new Service(p);
            })
        } catch (error) {
            return new Error('Error get all deposit by day');
        };
    }
    static async getAllWithdrawalByDay(day) {
        try {
            // Phân tích tháng và năm từ chuỗi đầu vào
            const [inputYear, inputMonth, inputDay] = day.split('-');

            // Sử dụng truy vấn SQL với điều kiện type='Deposit' và phân tích tháng và năm từ cột date để so sánh với tháng và năm được chỉ định
            const data = await db.execute(`
                SELECT * 
                FROM "services" 
                WHERE 
                    "type" = 'Withdrawal' 
                    AND 
                    DATE_PART('year', "date") = ${inputYear} 
                    AND 
                    DATE_PART('month', "date") = ${inputMonth}
                    AND
                    DATE_PART('day', "date") = ${inputDay}
            `);
            return data.map((p) => {
                return new Service(p);
            })
        } catch (error) {
            return new Error('Error get all withdrawal by day');
        };
    }
    static async makeDeposit (depositInfo) {
        try{
            const amount = depositInfo.amount;
            const passbook_id = depositInfo.passbookID;
            const date = depositInfo.date;
            const demandBook = await DemandBook.getByID(passbook_id);
            const newBalance = calH.calculateDemandBook(demandBook,date) + amount;
            // Update the demand_books table
            const updateQuery = `
            UPDATE demand_books
            SET balance = $1, start_date = $2
            WHERE passbook_id = $3;
            `;
            // Execute the update query
            const result = await db.execute(updateQuery, [newBalance, date, passbook_id]);
            return 1;
        } catch(error){
            console.log("error: " + error);
            throw error;
        }
    }
    static async addService(serviceInfo) {
        try {
            const { passbook_id, date, type, amount } = serviceInfo;
            
            // Get the highest existing service_id from the services table
            const highestServiceIdResult = await db.execute('SELECT MAX(CAST(SUBSTRING(service_id, 5) AS INT)) AS max_id FROM services');
            const maxId = highestServiceIdResult[0].max_id || 0;
            
            // Generate the new service_id by incrementing the highest existing id
            const newServiceId = `SERV${maxId + 1}`;
    
            // Insert the new service into the services table
            const insertQuery = `
                INSERT INTO services (service_id, passbook_id, date, type, amount)
                VALUES ($1, $2, $3, $4, $5)
            `;
            const insertValues = [newServiceId, passbook_id, date, type, amount];
            await db.execute(insertQuery, insertValues);
            
            return 1;
        } catch (error) {
            throw error;
        }
    }
    static async makeWidthDrawalForDemand(withdrawalInfo){
        try{
            const newBalance = withdrawalInfo.newBalance;
            const passbook_id = withdrawalInfo.passbookID;
            const date = withdrawalInfo.date;
            const updateQuery = `
            UPDATE demand_books
            SET balance = $1, start_date = $2
            WHERE passbook_id = $3;
            `;
            // Execute the update query
            const result = await db.execute(updateQuery, [newBalance, date, passbook_id]);
            return 1;
        } catch (error) {
            throw error;
        }
    }
    static async makeWidthDrawalForTerm(termBookInfo){
        try{
            const passbook_id = termBookInfo.passbookID;
            const date = termBookInfo.date;
            const updateQuery = `
            UPDATE term_saving_books
            SET deposit_amount = 0, start_date = $2, maturity_times = 0
            WHERE passbook_id = $1;
            UPDATE passbooks
            SET status = false
            WHERE passbook_id = $1;
            `;
            // Execute the update query
            const result = await db.execute(updateQuery, [passbook_id, date]);
            return 1;
        } catch (error) {
            throw error;
        }
    }
    static async getPassbooksByType(type) {
        try {
            const query = `
                SELECT *
                FROM passbooks
                WHERE type = $1;
            `;
            const result = await db.execute(query, [type]);
            return result.map((p) => {
                return new Service(p);
            });
        } catch (error) {
            throw error;
        }
    }
    static async getAllServiceByDay(day) {
        try {
            // Phân tích tháng và năm từ chuỗi đầu vào
            const [inputYear, inputMonth, inputDay] = day.split('-');

            // Sử dụng truy vấn SQL với điều kiện type='Deposit' và phân tích tháng và năm từ cột date để so sánh với tháng và năm được chỉ định
            const data = await db.execute(`
                SELECT * 
                FROM "services" 
                WHERE 
                    DATE_PART('year', "date") = ${inputYear} 
                    AND 
                    DATE_PART('month', "date") = ${inputMonth}
                    AND
                    DATE_PART('day', "date") = ${inputDay}
            `);

            return data.map((p) => {
                return new Service(p);
            })
        } catch (error) {
            throw error;
        }
    }
}