const hbs = require('express-handlebars');
const path = require('path');
const Handlebars = require('handlebars');

function handlebars(app) {
    app.engine('hbs', hbs.engine({
        extname: "hbs",
        layoutsDir: path.join(__dirname, "../views", "layouts"),
        partialsDir: path.join(__dirname, "../views", "partials"),
        defaultLayout: "home",
    }));
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, '../views'));

    // Định nghĩa helper eq
    Handlebars.registerHelper('eq', function (a, b, options) {
        return a === b ? options.fn(this) : options.inverse(this);
    });
    Handlebars.registerHelper('addOne', function(value) {
        // Trả về giá trị tăng lên một đơn vị
        return value + 1;
      });
}

module.exports = handlebars;