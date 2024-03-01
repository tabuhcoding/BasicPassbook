const db = require('../Utils/db');
const calculateH = require('../helper/calculatorBalance.h');
module.exports = class Demand_Book{
    constructor(obj){
        this.passbook_id = obj.passbook_id;
        this.start_date = obj.start_date;
        this.balance = obj.balance;
    }
    static async getAll(){
        try {
            const data = await db.execute('SELECT * FROM "demand_books"');
            return data.map((p) => {
                return new Demand_Book(p);
            })
        } catch (error) {
            throw error;
        };
    }
    static async getByID(id){
        try {
            const data = await db.execute(`SELECT * FROM "demand_books" WHERE "passbook_id" = '${id}'`);
            if (data.length > 0) {
                return new Demand_Book(data[0]); // Trả về phần tử đầu tiên của mảng data
            } else {
                return null; // Trả về null nếu không có kết quả nào được tìm thấy
            }
        } catch (error) {
            throw error;
        };
    }
    static async addPassbook(passbookInfo) {
        try {
            await db.execute(`INSERT INTO "demand_books"(
                                "passbook_id", "start_date", "balance")
                                VALUES ('${passbookInfo.passbook_id}', '${passbookInfo.date}', ${passbookInfo.balance});`);
            return true;
        } catch (error) {
            throw error;
        };
    }
    static async getBalance(id, date){
        try {
            const demand_book = await this.getByID(id);
            const nowBalance = calculateH.calculateDemandBook(demand_book, date) || 0;
            return nowBalance;
        } catch (error) {
            throw error;
        };
    }
}