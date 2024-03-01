// dateUtils.js
module.exports.getCurrentDateWithoutTime = function () {
    const today = new Date();
    const year = today.getFullYear(); // Lấy năm hiện tại
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Lấy tháng hiện tại và thêm số 0 phía trước nếu cần
    const day = String(today.getDate()).padStart(2, '0'); // Lấy ngày hiện tại và thêm số 0 phía trước nếu cần

    return `${year}-${month}-${day}`; // Trả về chuỗi năm-tháng-ngày
};
