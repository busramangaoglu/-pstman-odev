var mongoose=require('mongoose');
var Venue=mongoose.model("venue");

const createResponse=function(res,status,content){
    res.status(status).json(content);
}

const listVenues=function(req,res){
    createResponse(res,200,{status:"başarılı"});
}

const addVenue=function(req,res){
    createResponse(res,200,{status:"başarılı"});
}

const getVenue=function(req,res){
    createResponse(res,200,{status:"başarılı"});
}

const updateVenue=function(req,res){
    createResponse(res,200,{status:"başarılı"});
}

const deleteVenue=function(req,res){
    createResponse(res,200,{status:"başarılı"});
}

module.exports={
    listVenues,
    addVenue,
    getVenue,
    updateVenue,
    deleteVenue
}