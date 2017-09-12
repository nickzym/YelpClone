//all middleware goes here
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkRestaurantOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Restaurant.findById(req.params.id, function(err, foundRestaurant){
           if(err){
               req.flash("error", "Restaurant not found!");
               res.redirect("back");
           } else{
               if(foundRestaurant.author.id.equals(req.user._id)){
                   next();
               }else {
                   req.flash("error", "You don't have permission!");
                   res.redirect("back");
               }
           }
        });
    }else {
        req.flash("error", "You need to be logged in!");
        res.redirect("back");
    }
    
};

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               req.flash(err.message);
               res.redirect("back");
           } else{
               if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                   next();
               }else {
                   req.flash("error", "You don't have permission to do that!");
                   res.redirect("back");
               }
           }
        });
    }else {
        req.flash("error", "You need to be logged in!");
        res.redirect("back");
    }
    
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in!");
    res.redirect("/login");
};

middlewareObj.checkUserRestaurant = function(req, res, next){
    Restaurant.findById(req.params.id, function(err, foundRestaurant){
      if(err || !foundRestaurant){
          console.log(err);
          req.flash('error', 'Sorry, that restaurant does not exist!');
          res.redirect('/restaurants');
      } else if(foundRestaurant.author.id.equals(req.user._id) || req.user.isAdmin){
          req.restaurant = foundRestaurant;
          next();
      } else {
          req.flash('error', 'You don\'t have permission to do that!');
          res.redirect('/restaurants/' + req.params.id);
      }
    });
  };

middlewareObj.checkUserComment = function(req, res, next){
    Comment.findById(req.params.commentId, function(err, foundComment){
       if(err || !foundComment){
           console.log(err);
           req.flash('error', 'Sorry, that comment does not exist!');
           res.redirect('/restaurants');
       } else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
            req.comment = foundComment;
            next();
       } else {
           req.flash('error', 'You don\'t have permission to do that!');
           res.redirect('/restaurants/' + req.params.id);
       }
    });
  }
module.exports = middlewareObj;