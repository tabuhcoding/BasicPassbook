const db = require('../Utils/db');
const customerModule = require('./customer.m');
const demandModule = require('./demand_book.m');
const termsavingModule = require('./term_saving_book.m');


module.exports = class Passbook{
    constructor(obj){
        this.passbook_ID = obj.passbook_id;
        this.customer_ID = obj.customer_id;
        this.type = obj.type;
        this.open_date = obj.open_date;
        this.status = obj.status;
    }
    static async getAll(){
        try {
            const data = await db.execute('SELECT * FROM "passbooks"');
            return data.map((p) => {
                return new Passbook(p);
            })
        } catch (error) {
            throw error;
        };
    }
    static async getByID(id){
        try {
            const data = await db.execute(`SELECT * FROM "passbooks" WHERE "passbook_id" = '${id}'`);
            if (data.length > 0) {
                return new Passbook(data[0]); // Trả về phần tử đầu tiên của mảng data
            } else {
                return null; // Trả về null nếu không có kết quả nào được tìm thấy
            }
        } catch (error) {
            throw error;
        };
    }
    static async getByFilter(searchFilter){
        try {
            // Xây dựng câu truy vấn SQL dựa trên điều kiện của từng trường trong searchFilter
            let sqlQuery = `SELECT * FROM "passbooks" WHERE 1=1`;
    
            // Thêm điều kiện cho mỗi trường trong searchFilter
            if (searchFilter.passbook_id) {
                sqlQuery += ` AND "passbook_id" = '${searchFilter.passbook_id}'`;
            }
            if (searchFilter.customer_id) {
                sqlQuery += ` AND "customer_id" = '${searchFilter.customer_id}'`;
            }
            if (searchFilter.type) {
                sqlQuery += ` AND "type" = '${searchFilter.type}'`;
            }
            // Thêm điều kiện cho open_date nếu có giá trị
            if (searchFilter.defaultMonth) {
                const [year, month] = searchFilter.defaultMonth.split('-');
                const startDate = `${year}-${month.padStart(2, '0')}-01`;
                const endDate = `${year}-${month.padStart(2, '0')}-${
                    new Date(year, parseInt(month) + 1, 0).getDate()}`;
                sqlQuery += ` AND "open_date" >= '${startDate}' AND "open_date" < '${endDate}'`;
            }
            console.log(sqlQuery);
            // Thực hiện truy vấn SQL
            const data = await db.execute(sqlQuery);
            
            // Trả về kết quả sau khi chuyển đổi thành đối tượng Passbook
            return data.map((p) => {
                return new Passbook(p);
            });
        } catch (error) {
            throw error;
        }
    }    
    static async getByType(type) {
        try {
            const data = await db.execute(`SELECT * FROM "passbooks" WHERE "type" = '${type}'`);
            return data.map((c) => {
                return new Passbook(c);
            })
        } catch (error) {
            throw error;
        };
    }
    static async getByTypeAndMonth(month, type) {
        try {
            const [inputYear, inputMonth] = month.split('-');
            const data = await db.execute(`
                SELECT passbook_id, customer_id, type, TO_CHAR(open_date, 'YYYY-MM-DD') AS open_date, status
                FROM "passbooks"
                WHERE type = '${type}' 
                AND DATE_PART('year', "open_date") = ${inputYear}
                AND DATE_PART('month', "open_date") = ${inputMonth} 
            `);
            return data.map((c) => {
                return new Passbook(c);
            })
        } catch (error) {
            throw error;
        };
    }
    static async getTypeOfPassbook(id) {
        try {
            const data = await db.execute(`SELECT * FROM "passbooks" WHERE "passbook_id" = '${id}'`);
            if(data.length > 0){
                return data[0].type;
            }
            return null;
        } catch (error) {
            throw error;
        };
    }
    static async getByCusID(id) {
        try {
            const data = await db.execute(`SELECT * FROM "passbooks" WHERE "customer_id" = '${id}'`);
            return data.map((c) => {
                return new Passbook(c);
            })
        } catch (error) {
            throw error;
        };
    }
    static async addPassbook(passbookInfo) {
        try {
            const existingPassbook = await db.execute(`SELECT * FROM "passbooks" WHERE "passbook_id" = '${passbookInfo.passbook_id}'`);
            if (existingPassbook.length > 0) {
                throw new Error('PassBookID has exits');
            }
            console.log('pass chua co');
            // Kiểm tra xem customer_id đã tồn tại chưa
            const existingCustomer = await db.execute(`SELECT * FROM "customers" WHERE "customer_id" = '${passbookInfo.customerInfor.id}'`);
            if (existingCustomer.length <= 0) {
                customerModule.addCustomer(passbookInfo.customerInfor);
            }
            else console.log('cus co roi');
            await db.execute(`INSERT INTO "passbooks"(
                                "customer_id", "passbook_id", "type", "open_date", "status")
                                VALUES ('${passbookInfo.customerInfor.id}', '${passbookInfo.passbook_id}', '${passbookInfo.type}', '${passbookInfo.date}', '${true}');`);
            console.log('add pb');
            if(passbookInfo.type == 'Demand'){
                console.log('add dpb');
                return await demandModule.addPassbook(passbookInfo);
            }
            else {
                console.log('add tpb');
                return await termsavingModule.addPassbook(passbookInfo);
            }
        } catch (error) {
            throw error;
        };
    }
    static async deactivePassbook(id){
        try {
            // Update trạng thái của passbook có ID tương ứng thành false
            await db.execute(`UPDATE "passbooks" SET "status" = false WHERE "passbook_id" = '${id}'`);
            return true; // Trả về true nếu thành công
        } catch (error) {
            throw error;
        }
    }
    static async getBalance(id, date){
        try {
            const pb = await this.getByID(id);
            if(pb.type === 'Demand'){
                return await demandModule.getBalance(id,date);
            }
            else{
                return await termsavingModule.getBalance(id,date, pb.type);
            }
        } catch (error) {
            throw error;
        };
    }
    
}