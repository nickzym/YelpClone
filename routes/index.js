var express = require("express");
var router = express.Router();
require('dotenv').config({path: '../.env'});
var passport = require("passport");
var User = require("../models/user");
var Restaurant = require("../models/restaurant");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");


router.get("/", function(req, res){
    res.render("landing");
});

//register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

router.post("/register", function(req, res){
    //this method provided by passport local mongoose 
    
   var newUser = new User(
       {
           username: req.body.username, 
           firstName: req.body.firstName, 
           lastName: req.body.lastName,
           email: req.body.email,
           avator: req.body.avator
           
       });
  if(req.body.adminCode === 'secretcode123') {
      newUser.isAdmin = true;
  }
   User.register(newUser, req.body.password, function(err, user){
      if(err){
          req.flash("error", err.message);
          return res.redirect("register");
      } 
        passport.authenticate("local")(req, res, function(){
        req.flash("success", "Welcome to YelpCamp " + user.username);
        res.redirect("/restaurants") 
      });
   });
});


//show login form

router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/restaurants",
        failureRedirect: "/login"
        
    }), function(req, res){
    
});

//log out
router.get("/logout", function(req, res){
   req.logout(); 
   req.flash("success", "Logged you out!");
   res.redirect("/restaurants");
});

//forgot password
router.get("/forgot", function(req, res){
    res.render("users/forgot");
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'yimingzhnick@gmail.com',
          pass: process.env.GMAILPWD
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'yimingzhnick@gmail.com',
        subject: 'YelpCamp Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n\n' +
          'Yiming Zhang / Nick'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

//reset password
router.get('/reset/:token', function(req, res){
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
       if(!user || err) {
           req.flash("error", "Password reset token is invalid or has expired.");
           return res.redirect('/forgot');
       }
       res.render('users/reset', {token: req.params.token});
    });
});


router.post("/reset/:token", function(req, res){
    async.waterfall([
        function(done){
            User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
                if(!user || err){
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if(req.body.password === req.body.confirm){
                    user.setPassword(req.body.password, function(err){
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        user.save(function(err){
                            req.logIn(user, function(err){
                                done(err, user);
                            });
                        });
                    });
                }else {
                    req.flash("error", "Passwords do not match. Please retype.");
                    return res.redirect('back');
                }
            });
        } ,
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
               service: 'Gmail',
               auth: {
                   user: 'yimingzhnick@gmail.com',
                   pass: process.env.GMAILPWD
               }
           });
           
           var mailOptions = {
               to: user.email,
               from: 'yimingzhnick@gmail.com',
               subject: 'YelpCamp: Password has been changed',
               text: 'You are receiving this email because you have changed your password for your account ' + user.email + '.\n' + 
                     
                     'If you did not request this, please contact us by just send an email to yimingzh@usc.edu\n' +
                     'We will process your problem as soon as possble and provide our technique support.\n\n' + 
                     'Yiming Zhang / Nick'
           };
           smtpTransport.sendMail(mailOptions, function(err){
               req.flash('success', 'Success! Your password has been changed!!');
               done(err);
           });
        }
        
    ], function(err){
        res.redirect('/restaurants');
    });
});
//users profile
router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
       if(err){
           req.flash("error", err.message);
           res.redirect("back");
       } 
       Restaurant.find().where('author.id').equals(foundUser._id).exec(function(err,restaurants){
           if(err){
               req.flash("error", err.message);
               res.redirect("back");
           } 
           res.render("users/show", {user: foundUser, restaurants: restaurants});
       });
       
    });
});

module.exports = router;