const db = require('../Utils/db');

module.exports = class Customer{
    constructor(obj){
        this.phone = obj.phone;
        this.name = obj.name;
        this.address = obj.address;
        this.identityNumber = obj.identity_number;
        this.id = obj.customer_id;
    }
    static async findCustomer(id) {
        try {
            let rs = await db.execute(`SELECT * FROM "customers" WHERE "customer_id" = '${id}';`);
            const data =  rs.map( (u) => {
                return new Customer(u);
            });
            if(data.length <= 0 ){
                return null;
            }
            else{
                return data[0];
            }
        } catch (error) {
            throw (error)
        };
    }
    static async addCustomer(customerInfor) {
        try {
            // Kiểm tra xem customer_id đã tồn tại chưa
            const existingCustomer = await db.execute(`SELECT * FROM "customers" WHERE "customer_id" = '${customerInfor.id}'`);
            if (existingCustomer.length > 0) {
                throw new Error('Customer with the same ID already exists.'); // Nếu đã tồn tại, ném một lỗi
            }
            else{
            await db.execute(`INSERT INTO "customers"(
                                "customer_id", "name", "phone", "address", "identity_number")
                                VALUES ('${customerInfor.id}', '${customerInfor.name}', '${customerInfor.phone}', '${customerInfor.address}', '${customerInfor.identityNumber}');`);
            return true;
            }
        } catch (error) {
            throw error;
        };

    }
}