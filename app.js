'use strict';

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const methodOverride = require('method-override');

const indexRouter = require('./routes/index');
const addRouter = require('./routes/add');
const dataRouter = require('./routes/data');
const updateRouter = require('./routes/update');
const deleteRouter = require('./routes/delete');
const apiRouter = require('./routes/api');

const app = express();
app.locals.appVersion = require('./package.json').version;

// Impostazioni template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Disabilita header che espone tecnologia
app.disable('x-powered-by');

// Middleware di sicurezza di base
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Logger solo in ambiente non-test
if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}

// Body parsers con limite di dimensione
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Asset statici
app.use('/bootstrap-icons', express.static(path.join(__dirname, 'node_modules/bootstrap-icons/font')));
app.use('/image', express.static(path.join(__dirname, 'public', 'images')));
app.use('/css', express.static(path.join(__dirname, 'public', 'stylesheets')));
app.use('/js', express.static(path.join(__dirname, 'public', 'javascripts')));

// Routing applicazione
app.use('/api', apiRouter);
app.use('/', indexRouter);
app.use('/add', addRouter);
app.use('/data', dataRouter);
app.use('/update', updateRouter);
app.use('/delete', deleteRouter);

// Gestione 404
app.use(function (req, res, next) {
  res.status(404);

  if (req.accepts('html')) {
    return res.render('notfound', {
      title: 'Pagina non trovata - CarMaintenance',
      url: req.originalUrl || req.url
    });
  }
  if (req.accepts('json')) {
    return res.json({ error: 'Risorsa non trovata', url: req.originalUrl || req.url });
  }
  res.type('txt').send('Not found');
});

// Gestione errori centralizzata (firma standard Express a 4 argomenti)
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  res.status(status);

  const isDev = req.app.get('env') === 'development';
  const errorMessage = err.message || 'Si è verificato un errore imprevisto';
  const errorDetails = isDev ? err : {};

  if (req.accepts('json') && !req.accepts('html')) {
    return res.json({
      error: errorMessage,
      status,
      ...(isDev ? { stack: err.stack } : {})
    });
  }

  res.locals.message = errorMessage;
  res.locals.error = errorDetails;
  res.locals.title = `Errore ${status} - CarMaintenance`;
  res.render('error');
});

module.exports = app;
