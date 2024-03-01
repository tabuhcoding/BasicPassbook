const express = require('express');
const handlebarsConfig = require('./configs/HandlebarsConfig');
const bodyParser = require('body-parser');
const path=require('path');
require('dotenv').config();
const port = process.env.PORT;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.use((err, req, res, next) => {
    const statusCode = err.statusCode | 500;
    res.status(statusCode).send(err.message);
});

handlebarsConfig(app);



const homeRoutes = require('./routes/home.r');
const openPassbookRoutes = require('./routes/openP.r');
const serviceRoutes = require('./routes/service.r');
const reportRoutes = require('./routes/report.r');
const regulationRoutes = require('./routes/regulation.r');
app.use('/report', reportRoutes);
app.use('/regulation', regulationRoutes);
app.use('/service', serviceRoutes);
app.use('/', homeRoutes);
app.use('/openPassbook', openPassbookRoutes);
app.use((err, req, res, next) => {
    const statusCode = err.statusCode | 500;
    res.status(statusCode).send(err.message);
});
app.listen(port, () => console.log(`Akashic Banking is running on http://localhost:${port}`));
