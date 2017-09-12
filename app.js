var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Restaurant = require("./models/restaurant");
var Comment = require("./models/comment");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");
var methodOverride = require("method-override");
var flash = require("connect-flash");

var commentRoutes = require("./routes/comment");
var restaurantRoutes = require("./routes/restaurants");
var indexRoutes = require("./routes/index");

require("dotenv").config();
mongoose.connect("mongodb://localhost/yelp_camp");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));//overide for what is _method
// seedDB();

//passport configuration
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.locals.moment = require("moment");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/",indexRoutes);
app.use("/restaurants/:id/comments",commentRoutes);
app.use("/restaurants", restaurantRoutes);



app.listen(process.env.PORT, process.env.IP, function(){
   
    console.log("Yelp server has started!");
});

