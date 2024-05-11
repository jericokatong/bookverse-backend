const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./app/v1/index/router');
const authenticationRouter = require('./app/v1/authentication/router');
const penjagaRouter = require('./app/v1/penjaga/router');
const adminRouter = require('./app/v1/admin/router');
const bookRouter = require('./app/v1/book/router');
const peminjamRouter = require('./app/v1/peminjam/router');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/authentication', authenticationRouter);
app.use('/penjaga', penjagaRouter);
app.use('/admin', adminRouter);
app.use('/book', bookRouter);
app.use('/peminjam', peminjamRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    status: 'fail',
    message: 'API NOT FOUND',
  });
});

module.exports = app;
