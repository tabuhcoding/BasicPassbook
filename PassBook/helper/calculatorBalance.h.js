const regular = require('../models/regulation.m')
const passbook = require ('../models/passbook.m');
module.exports = {
    calculateDemandBook: (demandBook, currentDate) => {
        const start_date = demandBook.start_date;
        const balance = demandBook.balance;
        const current_date = new Date(currentDate);
        const rate = regular.getDemandRate(start_date) / 100;
        let daysDiff = Math.ceil((current_date - start_date) / (1000 * 60 * 60 * 24)); // Calculate the difference in days
        if (daysDiff<regular.getMinTimeToGetRate(start_date)) daysDiff=0;
        const newBl = (rate / 365 * daysDiff + 1) * balance ;
        const newBalance = parseInt(newBl); // Calculate the new balance
        return newBalance;
    },
    calculateTermSavingBook: async (termBook, currentDate) => {
        const pb = await passbook.getByID(termBook.passbook_id);
        const type = pb.type;
        const start_date = new Date(termBook.start_date);
        const deposit_amount = termBook.deposit_amount;
        const maturity_times = termBook.maturity_times;
        
        // Extracting term from type
        const termMatch = type.match(/\d+/); // Extracts the number from the type string
        const term = termMatch ? parseInt(termMatch[0]) : 0; // Parses the extracted number as an integer, defaulting to 0 if not found
        const curr = new Date(currentDate);
        const rate = regular.getTermRate(type, start_date);
        console.log(termBook.passbook_id + " " + termBook.start_date + " " + rate);
        const daysDiff = Math.min(Math.ceil((curr - start_date) / (1000 * 60 * 60 * 24)), term * 30); // Calculate the minimum of (current date - start_date) and term*30
        const balance = deposit_amount * (rate / 365 * daysDiff + 1 ) + deposit_amount * Math.pow((rate / 365 * term * 30 + 1), maturity_times);
        const newBalance = parseInt(balance); // Calculate the new balance
        return newBalance;
    },
    calculateTSB: async (termBook, currentDate, type) => {
        const start_date = new Date(termBook.start_date);
        const deposit_amount = termBook.deposit_amount;
        const maturity_times = termBook.maturity_times;
        
        // Extracting term from type
        const termMatch = type.match(/\d+/); // Extracts the number from the type string
        const term = termMatch ? parseInt(termMatch[0]) : 0; // Parses the extracted number as an integer, defaulting to 0 if not found
        const curr = new Date(currentDate);

        const rate = regular.getTermRate(type, start_date);
        console.log(termBook.passbook_id + " " + termBook.start_date + " " + rate);
        const daysDiff = Math.min(Math.ceil((curr - start_date) / (1000 * 60 * 60 * 24)), term * 30); // Calculate the minimum of (current date - start_date) and term*30
        const balance = deposit_amount * (rate / 365 * daysDiff + 1 ) + deposit_amount * Math.pow((rate / 365 * term * 30 + 1), maturity_times);
        const newBalance = parseInt(balance); // Calculate the new balance
        return newBalance;
    }
}