var express = require("express");
var router = express.Router();
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");
var middleware = require("../middleware/index.js");
var geocoder =require("geocoder");

router.get("/", function(req, res){

    Restaurant.find({},function(err, allRestaurants){
       if(err){
           console.log(err);
       } else{
           res.render("restaurant/index", {restaurants : allRestaurants, currentUser: req.user, page: 'restaurants'});
       }
    });
    
});          

router.post("/", middleware.isLoggedIn, function(req,res){
    //get data from form and add to restaurants arr
    //redirect back to restaurants again
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var des = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newRestaurant = {name: name, image: image, description: des, price: price, author:author, location: location, lat: lat, lng: lng};
    // Create a new restaurant and save to DB
    Restaurant.create(newRestaurant, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to restaurants page
            console.log(newlyCreated);
            res.redirect("/restaurants");
        }
    });
  });
    
    
});

router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("restaurant/new");
});

router.get("/:id", function(req, res){
    Restaurant.findById(req.params.id).populate("comments").exec(function(err, foundRestaurant){
        if(err){
            console.log(err);
        }else {
            res.render("restaurant/show", {restaurant: foundRestaurant});
        }
    });

});

//edit restaurant
// router.get("/:id/edit", middleware.checkRestaurantOwnership, function(req, res){
//     Restaurant.findById(req.params.id, function(err, foundRestaurant){
//         res.render("restaurant/edit", {restaurant: foundRestaurant}); 
//     });
   
// });

router.get("/:id/edit", middleware.isLoggedIn, middleware.checkUserRestaurant, function(req, res){
  //render edit template with that restaurant
  res.render("restaurant/edit", {restaurant: req.restaurant});
});


//update restaurant
router.put("/:id", middleware.checkUserRestaurant, function(req,res){
    geocoder.geocode(req.body.restaurant.location, function(err, data){

        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newData = req.body.restaurant;
        newData.location = location;
        newData.lat = lat;
        newData.lng = lng;
        
        Restaurant.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, restaurant){
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success","Successfully Updated!");
                res.redirect("/restaurants/" + restaurant._id);
            }
        });
    });
 
});

//destroy restaurant route
router.delete("/:id", middleware.checkUserRestaurant, function(req, res){
    Restaurant.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/restaurants");
        }else {
            res.redirect("/restaurants");
        }
    });
});


module.exports = router;