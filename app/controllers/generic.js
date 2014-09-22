// NOTE: use this script to create an nconf compatible settings file.  It will create (or overwrite/update) a file called nconf.json in the same folder as this script.
var settings = require('../../config/settings');
var utils = require('../core/utils');
var handlers = require('../core/handlers');
var singularize = require('../../config/singularize');

var getModelName = function(req, next) {
    var name = req.params.model;
    if(req.models[name]) {
        return name;
    }
    else if(req.models[singularize[name]]) {
        return singularize[name];
    }
    else {
        return next(new Restify.ResourceNotFoundError("No model defined for " + name));
    }
};

module.exports = {
    getAll: function (req, res, next)  {
        req.models[getModelName(req,next)].find({}, function(err, data) {
            handlers.getHandler(req,res,next,err,data);
        });
    },

    get: function (req, res, next)  {
        req.models[getModelName(req,next)].get(req.params.id, function(err, data){
            handlers.getHandler(req,res,next,err,data);
        });
    },

    put: function (req, res, next) {
        req.models[getModelName(req,next)].get(req.params.id, function(err, data){
            handlers.putHandler(req,res,next,err,data);
        });
    },

    post: function (req, res, next) {
        var model = utils.createNewModel(req.models[getModelName(req,next)], req.params);
        req.models[getModelName(req,next)].create(model, function(err, data) {
            handlers.createHandler(req,res,next,err,data);
        });
    },

    del: function (req, res, next) {
        req.models[getModelName(req,next)].get(req.params.id, function(err, data){
            handlers.delHandler(req,res,next,err,data);
        });
    }
};
