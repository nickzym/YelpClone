var mongoose = require("mongoose");
var Restaurant = require("./models/restaurant");
var Comment = require("./models/comment");


var data = [
    {
        name: "Cloud's Rest", 
        image: "https://farm7.staticflickr.com/6188/6106475454_cf4dab4d64.jpg",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    {
        name: "Desert Mesa", 
        image: "https://farm6.staticflickr.com/5786/20607281024_5c7b3635cc.jpg",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    {
        name: "Canyon Floor", 
        image: "https://farm5.staticflickr.com/4285/35301859822_4d49713574.jpg",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    }
    
];
function seedDB() {
    Restaurant.remove({}, function(err){
        if(err){
            console.log(err);
        }else{
        }
        data.forEach(function(seed){
        Restaurant.create(seed, function(err, restaurant){
                if(err){
                    console.log(err);
                }else {
                    Comment.create(
                        {
                            text: "This place is greate. But I wish there was internet",
                            author: "Homer"
                        }, function(err, comment){
                            if(err){
                                console.log(err);
                            }else{
                                restaurant.comments.push(comment);
                                restaurant.save();
                            }
                            
                        }
                    );
                }
            });
        });
        
    });
    
    
}

module.exports = seedDB;