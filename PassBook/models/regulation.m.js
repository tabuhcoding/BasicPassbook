const jsonH = require('../helper/json.h');
module.exports = {
    getTermRate: (terms,date) => {
        try{
            const data = jsonH.getAll();
            var termRate = data.REGULATION.TERM.find((item) => item.TERMS === terms);
            if(!termRate){
                termRate = data.REGULATION.DELETED_TERM.find((item) => item.TERMS === terms);
            }
            if (termRate) {
                let last_date = termRate.LASTRATEDATE ? new Date(termRate.LASTRATEDATE) : null; // Chuyển đổi LASTRATEDATE thành đối tượng Date, hoặc null nếu nó rỗng
                let comparisonDate = date; // Chuyển đổi date thành đối tượng Date
                console.log("lastdate: " + last_date + " comparisonDate: " + comparisonDate);
                if (last_date < comparisonDate) {
                    return termRate.RATE;
                } else  {
                    return termRate.LASTRATE;
                } 
            }
            return 0;
        }catch(error){
            throw error;
        }
        
    },
    getDemandRate: (date) => {
        try{
            const data = jsonH.getAll();
            var demandRate = data.REGULATION.DEMAND_RATE;
            let last_date =new Date(data.REGULATION.DEMAND_LASTRATEDATE); // Chuyển đổi LASTRATEDATE thành đối tượng Date, hoặc null nếu nó rỗng
            let comparisonDate = date; // Chuyển đổi date thành đối tượng Date
            
            if (last_date < comparisonDate) {
                demandRate = data.REGULATION.DEMAND_RATE;
            } else  {
                demandRate = data.REGULATION.DEMAND_LASTRATE;
            } 
            console.log(demandRate);
            return demandRate;
        }catch(error){
            throw error;
        }
        
    },
    getMinDeposit: (date) => {
        try{
            const data = jsonH.getAll();
            var min = data.REGULATION.MIN_DEPOSIT;
            let last_date =new Date(data.REGULATION.MIN_DEPOSIT_LAST_DATE); // Chuyển đổi LASTRATEDATE thành đối tượng Date, hoặc null nếu nó rỗng
            let comparisonDate = new Date(date); // Chuyển đổi date thành đối tượng Date
            
            if (last_date < comparisonDate) {
                min = data.REGULATION.MIN_DEPOSIT;
            } else  {
                min =  data.REGULATION.MIN_DEPOSIT_LAST;
            } 
            return min;
        }catch(error){
            throw error;
        }
        
    },
    getMinToWithdrawal: (date) => {
        try{
            const data = jsonH.getAll();
            var min = data.REGULATION.MIN_TO_WITHDRAWAL;
            let last_date =new Date(data.REGULATION.MIN_TO_WITHDRAWAL_LAST_DATE); // Chuyển đổi LASTRATEDATE thành đối tượng Date, hoặc null nếu nó rỗng
            let comparisonDate = new Date(date); // Chuyển đổi date thành đối tượng Date
            
            if (last_date < comparisonDate) {
                min = data.REGULATION.MIN_TO_WITHDRAWAL;
            } else  {
                min =  data.REGULATION.MIN_TO_WITHDRAWAL_LAST;
            } 
            return min;
        }catch(error){
            throw error;
        }
    },
    getMinTimeToGetRate: () =>{
        try{
            const data = jsonH.getAll();
            const min = data.REGULATION.MIN_TO_GET_RATE;
            return min;
        }catch(error){
            throw error;
        }
    },
    getAllType: () => {
        try{
            const data = jsonH.getAll();
            // Lấy mảng các giá trị TERMS từ mảng TERM
            const types = data.REGULATION.TERM.map(term => term.TERMS);

            // Thêm hai giá trị "All" và "Demand" vào đầu mảng types
            types.unshift("All", "Demand");
            return types;
        }catch(error){
            throw error;
        }
    },
    addNewTerm: (term, rate) => {
        try{
            const dateNow = new Date().toISOString().slice(0, 10);
            const data = jsonH.getAll();            
            const newTerm = {
                TERMS: term,
                RATE: parseFloat(rate),
                LASTRATE: parseFloat(rate),
                LASTRATEDATE: dateNow,
            }
            data.REGULATION.TERM.push(newTerm);
            console.log(data);
            jsonH.update(data);
            return newTerm;
        }catch(error){
            throw error;
        }
    },
    deleteTerm: (term) => {
        try {
            const data = jsonH.getAll();
            const dateNow = new Date().toISOString().slice(0, 10); // Lấy ngày hiện tại dưới dạng yyyy-mm-dd
          
            const deleteTerm = data.REGULATION.TERM.find(item => item.TERMS === term); // Sử dụng find thay vì filter để tìm phần tử cụ thể
            data.REGULATION.TERM = data.REGULATION.TERM.filter(item => item.TERMS !== term);
            if (deleteTerm) {
              if (data.REGULATION.DELETED_TERM.some(item => item.TERMS === deleteTerm.TERMS)) {
                // Nếu `deleteTerm` đã tồn tại trong `data.REGULATION.DELETED_TERM`, cập nhật giá trị của nó
                const deletedTermIndex = data.REGULATION.DELETED_TERM.findIndex(item => item.TERMS === deleteTerm.TERMS);
                data.REGULATION.DELETED_TERM[deletedTermIndex].LASTRATE = deleteTerm.LASTRATE;
                data.REGULATION.DELETED_TERM[deletedTermIndex].RATE = deleteTerm.RATE;
                data.REGULATION.DELETED_TERM[deletedTermIndex].LASTRATEDATE = dateNow;
              } else {
                // Nếu `deleteTerm` chưa tồn tại trong `data.REGULATION.DELETED_TERM`, thêm nó vào mảng
                data.REGULATION.DELETED_TERM.push(deleteTerm);
              }
            }
          
            console.log(data);
            jsonH.update(data);
          
            return data;
          } catch (error) {
            throw error;
          }
          
    }
};


// readJsonData: (callback) => {
    //     fs.readFile('./Utils/regulation.json', 'utf8', (err, data) => {
    //         if (err) {
    //             console.error('Error reading file:', err);
    //             return callback(err, null);
    //         }

    //         try {
    //             // Parse dữ liệu JSON thành đối tượng JavaScript
    //             const jsonData = JSON.parse(data);
    //             callback(null, jsonData);
    //         } catch (error) {
    //             console.error('Error parsing JSON:', error);
    //             callback(error, null);
    //         }
    //     });
    // },

    // getMinDeposit: (callback) => {
    //     module.exports.readJsonData((err, jsonData) => {
    //         if (err) {
    //             return callback(err, null);
    //         }
    //         callback(null, jsonData.REGULATION.MIN_DEPOSIT);
    //     });
    // },

    // getMinToWithdrawal: (callback) => {
    //     module.exports.readJsonData((err, jsonData) => {
    //         if (err) {
    //             return callback(err, null);
    //         }
    //         callback(null, jsonData.REGULATION.MIN_TO_WITHDRAWAL);
    //     });
    // },

    // getDemandRate: (callback) => {
    //     module.exports.readJsonData((err, jsonData) => {
    //         if (err) {
    //             return callback(err, null);
    //         }
    //         callback(null, jsonData.REGULATION.DEMAND_RATE);
    //     });
    // },

    // getTermRate: (terms, callback) => {
    //     module.exports.readJsonData((err, jsonData) => {
    //         if (err) {
    //             return callback(err, null);
    //         }
    //         const term = jsonData.REGULATION.TERM.find((item) => item.TERMS === terms);
    //         if (term) {
    //             callback(null, term.RATE);
    //         } else {
    //             callback(new Error('Term not found'), null);
    //         }
    //     });
    // }