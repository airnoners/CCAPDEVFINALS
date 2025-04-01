const express = require("express");
const exphbs = require('express-handlebars');
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); 
const User = require("./models/user");  
const Listing = require("./models/listing");
const webRoutes = require('./routes/webRoutes');
const listingRoutes = require('./routes/listingRoutes');
const authRoutes = require('./routes/authRoutes');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./config/db');
const moment = require('moment');
const flash = require('connect-flash');
require("dotenv").config();
require('./config/passport');
const app = express();
const PORT = 3000;


// Connect to MongoDB
connectDB();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));


app.use(flash()); //so we can use flash
app.use(passport.initialize());
app.use(passport.session());
 
// Configure Handlebars as your view engine
app.engine('hbs', exphbs.engine({
  extname: '.hbs',          // Use .hbs extension for files
  defaultLayout: 'main',    // Main layout file (views/layouts/main.hbs)
  helpers: {
    block: function(name) {
      var blocks = this._blocks || (this._blocks = {});
      var content = blocks[name] || [];
      return content.join('\n');
    },
    contentFor: function(name, options) {
      var blocks = this._blocks || (this._blocks = {});
      var block = blocks[name] || (blocks[name] = []);
      block.push(options.fn(this));
    },
    formatDate: function(date, format) {
      if (!date) return ''; // Handle missing date
      const momentDate = moment(date);
      if (!momentDate.isValid()) return ''; // Handle invalid date
      return momentDate.format(format);
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// 6. Routes (AFTER all middleware)
app.use('/', webRoutes);
app.use('/listings', listingRoutes);
app.use('/api/auth', authRoutes);


// 7. Error Handling (Optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error');
});

// 8. Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});