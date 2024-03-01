const db = require('../Utils/db');
const calculateH = require('../helper/calculatorBalance.h');

module.exports = class Term_Saving_Book{
    constructor(obj){
        this.passbook_id = obj.passbook_id;
        this.start_date = obj.start_date;
        this.deposit_amount = obj.deposit_amount;
        this.maturity_times = obj.maturity_times;
    }
    static async getAll(){
        try {
            const data = await db.execute('SELECT * FROM "term_saving_books"');
            return data.map((p) => {
                return new Term_Saving_Book(p);
            })
        } catch (error) {
            throw error;
        };
    }
    static async getByID(id){
        try {
            const data = await db.execute(`SELECT * FROM "term_saving_books" WHERE "passbook_id" = '${id}'`);
            if (data.length > 0) {
                return new Term_Saving_Book(data[0]); // Trả về phần tử đầu tiên của mảng data
            } else {
                return null; // Trả về null nếu không có kết quả nào được tìm thấy
            }
        } catch (error) {
            throw error;
        };
    }
    static async addPassbook(passbookInfo) {
        try {
            await db.execute(`INSERT INTO "term_saving_books"(
                                "passbook_id", "start_date", "deposit_amount", "maturity_times")
                                VALUES ('${passbookInfo.passbook_id}', '${passbookInfo.date}', ${passbookInfo.balance}, 0);`);
            return true;
        } catch (error) {
            throw error;
        };
    }
    static async getBalance(id, date, type){
        try {
            const term_book = await this.getByID(id);
            const nowBalance = await calculateH.calculateTSB(term_book, date, type) || 0;
            return nowBalance;
        } catch (error) {
            throw error;
        };
    }
    
}