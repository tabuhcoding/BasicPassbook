const fs = require('fs');
const csv = require('csv-parser');
const db = require('../Utils/db'); // Thay thế đường dẫn với đúng đường dẫn của module kết nối cơ sở dữ liệu của bạn
// Hàm để đọc dữ liệu từ tệp CSV và import vào cơ sở dữ liệu
module.exports = { 
    importDataFromCSV: async function () {
        try {
            await this.readData();
            const message = 'Imported all data from CSV to PostgreSQL';
            console.log(message);
            return  message;
        } catch (error) {
            console.error('Error importing data from CSV to PostgreSQL', error);
        }
    },
    readData : async function ()  {
        // customers
        try {
            const tableName = 'customers';
            const csvFilePath = './public/data/customers.csv';
            // Đọc dữ liệu từ tệp CSV
            const results = await new Promise((resolve, reject) => {
                const results = [];
                fs.createReadStream(csvFilePath)
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', () => resolve(results))
                    .on('error', (error) => reject(error));
            });
            try {
                // Kiểm tra xem bảng đã tồn tại trong cơ sở dữ liệu chưa
                const tableExistsQuery = `
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = '${tableName}'
                    );
                `;
                const tableExistsResult = await db.execute(tableExistsQuery);

                const tableExists = tableExistsResult[0].exists;

                // Nếu bảng chưa tồn tại, tạo mới bảng
                if (!tableExists) {
                    const createTableQuery = `
                        CREATE TABLE ${tableName} (
                            customer_id VARCHAR(10),
                            name VARCHAR(50),
                            address VARCHAR(255),
                            phone VARCHAR(11),
                            identity_number VARCHAR(12),
                            PRIMARY KEY (customer_id)
                        );
                    `;
                    await db.execute(createTableQuery);
                }

                // Import dữ liệu vào bảng
                const insertQuery = `
                    INSERT INTO ${tableName} (customer_id, name, address, phone, identity_number)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (customer_id) DO NOTHING
                `;
                for (const row of results) {
                    const values = [row.Customer_ID, row.Name, row.Address, row.Phone, row.IdentityNumber];
                    await db.execute(insertQuery, values);
                }

                console.log('Imported data from customers.CSV to PostgreSQL');
            } catch (error) {
                console.error('Error importing data from CSV to PostgreSQL', error);
            }    
        } catch (error) {
            console.error('Error importing data from CSV to PostgreSQL', error);
        }
        // passbooks
        try {
            const tableName = 'passbooks';
            const csvFilePath = './public/data/passbooks.csv';
            // Đọc dữ liệu từ tệp CSV
            const results = await new Promise((resolve, reject) => {
                const results = [];
                fs.createReadStream(csvFilePath)
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', () => resolve(results))
                    .on('error', (error) => reject(error));
            });
            try {
                // Kiểm tra xem bảng đã tồn tại trong cơ sở dữ liệu chưa
                const tableExistsQuery = `
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = '${tableName}'
                    );
                `;
                const tableExistsResult = await db.execute(tableExistsQuery);

                const tableExists = tableExistsResult[0].exists;

                // Nếu bảng chưa tồn tại, tạo mới bảng
                if (!tableExists) {
                    const createTableQuery = `
                        CREATE TABLE ${tableName} (
                            passbook_id VARCHAR(10),
                            customer_id VARCHAR(10),
                            type VARCHAR(10),
                            open_date DATE,
                            status BOOLEAN,
                            PRIMARY KEY (passbook_id),
                            FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
                        );
                    `;
                    await db.execute(createTableQuery);
                }

                // Import dữ liệu vào bảng
                const insertQuery = `
                        INSERT INTO ${tableName} (passbook_id, customer_id, type, open_date, status)
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (passbook_id) DO NOTHING

                    `;
                for (const row of results) {
                    // Kiểm tra xem customer_id có tồn tại trong bảng customers không
                    const customerExistsQuery = `
                        SELECT EXISTS (
                            SELECT * FROM customers 
                            WHERE customer_id = $1
                        );
                    `;
                    const customerExistsResult = await db.execute(customerExistsQuery, [row.Customer_ID]);
                    const customerExists = customerExistsResult[0].exists;
                    if (!customerExists) {
                        // console.error(`Customer with ID ${row.Customer_ID} does not exist in customers table. Skipping import for passbook ID ${row.Passbook_ID}.`);
                        continue; // Bỏ qua việc import nếu customer_id không tồn tại
                    }
                    var _status = true;
                    if(row.Status == 'TRUE'){
                        _status = true;
                    }else _status= false;
                    const values = [row.Passbook_ID, row.Customer_ID, row.Type, row.OpenDate, _status];
                    await db.execute(insertQuery, values);
                }
                console.log('Imported data from passbooks.CSV to PostgreSQL');
            } catch (error) {
                console.error('Error importing data from CSV to PostgreSQL', error);
            }
        } catch (error) {
            console.error('Error importing data from CSV to PostgreSQL', error);
        }
        // demandbooks
        try {
            const tableName = 'demand_books';
            const csvFilePath = './public/data/demand_books.csv';
            // Đọc dữ liệu từ tệp CSV
            const results = await new Promise((resolve, reject) => {
                const results = [];
                fs.createReadStream(csvFilePath)
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', () => resolve(results))
                    .on('error', (error) => reject(error));
            });
            try {
                // Kiểm tra xem bảng đã tồn tại trong cơ sở dữ liệu chưa
                const tableExistsQuery = `
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = '${tableName}'
                    );
                `;
                const tableExistsResult = await db.execute(tableExistsQuery);

                const tableExists = tableExistsResult[0].exists;

                // Nếu bảng chưa tồn tại, tạo mới bảng
                if (!tableExists) {
                    const createTableQuery = `
                        CREATE TABLE ${tableName} (
                            passbook_id VARCHAR(10),
                            start_date DATE,
                            balance BIGINT,
                            PRIMARY KEY (passbook_id),
                            FOREIGN KEY (passbook_id) REFERENCES passbooks(passbook_id)
                        );
                    `;
                    await db.execute(createTableQuery);
                }

                // Import dữ liệu vào bảng
                const insertQuery = `
                        INSERT INTO ${tableName} (passbook_id, start_date, balance)
                        VALUES ($1, $2, $3)
                        ON CONFLICT (passbook_id) DO NOTHING

                    `;
                for (const row of results) {
                    // Kiểm tra xem passbook_id có tồn tại trong bảng customers không
                    const customerExistsQuery = `
                        SELECT EXISTS (
                            SELECT 1 
                            FROM passbooks 
                            WHERE passbook_id = $1 AND type = 'Demand'
                        );
                    `;
                    const customerExistsResult = await db.execute(customerExistsQuery, [row.Passbook_ID]);
                    const customerExists = customerExistsResult[0].exists;
                    if (!customerExists) {
                        // console.error(`Passbooks with ID ${row.Passbook_ID} does not exist in passbooks table. Skipping import for demandbooks ID ${row.Passbook_ID}.`);
                        continue; 
                    }

                    const values = [row.Passbook_ID, row.StartDate, row.Balance];
                    await db.execute(insertQuery, values);
                }
                console.log('Imported data from demand_books.CSV to PostgreSQL');
            } catch (error) {
                console.error('Error importing data from CSV to PostgreSQL', error);
            }
        } catch (error) {
            console.error('Error importing data from CSV to PostgreSQL', error);
        }
        // term saving books
        try {
            const tableName = 'term_saving_books';
            const csvFilePath = './public/data/term_saving_books.csv';
            // Đọc dữ liệu từ tệp CSV
            const results = await new Promise((resolve, reject) => {
                const results = [];
                fs.createReadStream(csvFilePath)
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', () => resolve(results))
                    .on('error', (error) => reject(error));
            });
            try {
                // Kiểm tra xem bảng đã tồn tại trong cơ sở dữ liệu chưa
                const tableExistsQuery = `
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = '${tableName}'
                    );
                `;
                const tableExistsResult = await db.execute(tableExistsQuery);

                const tableExists = tableExistsResult[0].exists;

                // Nếu bảng chưa tồn tại, tạo mới bảng
                if (!tableExists) {
                    const createTableQuery = `
                        CREATE TABLE ${tableName} (
                            passbook_id VARCHAR(10),
                            start_date DATE,
                            maturity_times SMALLINT,
                            deposit_amount BIGINT,
                            PRIMARY KEY (passbook_id),
                            FOREIGN KEY (passbook_id) REFERENCES passbooks(passbook_id)
                        );
                    `;
                    await db.execute(createTableQuery);
                }

                // Import dữ liệu vào bảng
                const insertQuery = `
                        INSERT INTO ${tableName} (passbook_id, start_date, maturity_times, deposit_amount)
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT (passbook_id) DO NOTHING

                    `;
                for (const row of results) {
                    // Kiểm tra xem passbook_id có tồn tại trong bảng customers không
                    const customerExistsQuery = `
                        SELECT EXISTS (
                            SELECT 1 
                            FROM passbooks 
                            WHERE passbook_id = $1 AND type <> 'Demand'
                        );
                    `;
                    const customerExistsResult = await db.execute(customerExistsQuery, [row.Passbook_ID]);
                    const customerExists = customerExistsResult[0].exists;
                    if (!customerExists) {
                        // console.error(`Passbooks with ID ${row.Passbook_ID} does not exist in passbooks table. Skipping import for term_saving_book ID ${row.Passbook_ID}.`);
                        continue; 
                    }

                    const values = [row.Passbook_ID, row.StartDate, row.MaturityTimes, row.DepositAmount];
                    await db.execute(insertQuery, values);
                }
                console.log('Imported data from term_saving_books.CSV to PostgreSQL');
            } catch (error) {
                console.error('Error importing data from CSV to PostgreSQL', error);
            }
        } catch (error) {
            console.error('Error importing data from CSV to PostgreSQL', error);
        }
        // services
        try {
            const tableName = 'services';
            const csvFilePath = './public/data/services.csv';
            // Đọc dữ liệu từ tệp CSV
            const results = await new Promise((resolve, reject) => {
                const results = [];
                fs.createReadStream(csvFilePath)
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', () => resolve(results))
                    .on('error', (error) => reject(error));
            });
            try {
                // Kiểm tra xem bảng đã tồn tại trong cơ sở dữ liệu chưa
                const tableExistsQuery = `
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = '${tableName}'
                    );
                `;
                const tableExistsResult = await db.execute(tableExistsQuery);

                const tableExists = tableExistsResult[0].exists;

                // Nếu bảng chưa tồn tại, tạo mới bảng
                if (!tableExists) {
                    const createTableQuery = `
                        CREATE TABLE ${tableName} (
                            service_id VARCHAR(15),
                            passbook_id VARCHAR(10),
                            date DATE,
                            type VARCHAR(12),
                            amount BIGINT,
                            PRIMARY KEY (service_id),
                            FOREIGN KEY (passbook_id) REFERENCES passbooks(passbook_id)
                        );
                    `;
                    await db.execute(createTableQuery);
                }

                // Import dữ liệu vào bảng
                const insertQuery = `
                        INSERT INTO ${tableName} (service_id, passbook_id, date, type, amount)
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (service_id) DO NOTHING

                    `;
                for (const row of results) {
                    // Kiểm tra xem passbook_id có tồn tại trong bảng customers không
                    const customerExistsQuery = `
                        SELECT EXISTS (
                            SELECT 1 
                            FROM passbooks 
                            WHERE passbook_id = $1
                        );
                    `;
                    const customerExistsResult = await db.execute(customerExistsQuery, [row.Passbook_ID]);
                    const customerExists = customerExistsResult[0].exists;
                    if (!customerExists) {
                        // console.error(`Passbooks with ID ${row.Passbook_ID} does not exist in passbooks table. Skipping import for service ID ${row.Passbook_ID}.`);
                        continue; 
                    }

                    const values = [row.Service_ID, row.Passbook_ID, row.Date, row.Type, row.Amount];
                    await db.execute(insertQuery, values);
                }
                console.log('Imported data from services.CSV to PostgreSQL');
            } catch (error) {
                console.error('Error importing data from CSV to PostgreSQL', error);
            }
        } catch (error) {
            console.error('Error importing data from CSV to PostgreSQL', error);
        }
    },
}