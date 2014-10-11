var http = require('http');
var fs = require('fs');
var async = require('async')
  , slug = require('slug')
  , _ = require('lodash');

module.exports = {
  formatErrors: function(errorsIn) {
    var errors = {};
    var a, e;

    for(a = 0; a < errorsIn.length; a++) {
      e = errorsIn[a];

      errors[e.property] = errors[e.property] || [];
      errors[e.property].push(e.msg);
    }
    return errors;
  },

  downloadFile: function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    console.log("starting download of " + url);
    var request = http.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(cb);  // close() is async, call cb after close completes.
        console.log("finished downloading " + dest);
      });
    }).on('error', function(err) { // Handle errors
      console.log('damn it');
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      if (cb) cb(err.message);
    });
  },
  
  //HELPERS
  set_deal_attributes_from_relations: function (deal, cb) {
    deal.getOffers(function (err, offers) {
      if (err) return cb(err)
      async.map(offers, module.exports.get_offer_availabilities, function (err, avails) {
        if (err) return next(err)
        
        if (avails[0]){
          var min = avails[0].min;
          var brand = avails[0].brand;
        }

        // attaching custom fields or empty string to each offer
        for(var i = 0; i < offers.length; i++){
          if(avails[0]){
            offers[i]['available_to'] = avails[0].available_to;
            offers[i]['ingredients'] = avails[0].ingredients;
            offers[i]['size'] = avails[0].size;
            offers[i]['country_of_origin'] = avails[0].country_of_origin;
          } else {
            offers[i]['available_to'] = "";
            offers[i]['ingredients'] = "";
            offers[i]['size'] = "";
            offers[i]['country_of_origin'] = "";
          }
        }
        
        deal.available_for_sale = min || null;
        deal.brand = brand || null;
        deal.offers = offers;
        
        cb(null, deal);
      })
    })
  },

  get_offer_availabilities: function(offer, cb) {
  
    offer.getProducts(function (err, products) {
      if (err) return cb(err)
                  
      async.map(products, module.exports.get_product_availabilities_and_brand, function (err, avails) {
        var results = {};
        if (err) return cb(err)
        if (avails[0]){
          results.brand = avails[0].brand || {};
          results.min = avails[0].available;
          results.size = avails[0].size || {};
          results.ingredients = avails[0].ingredients || {};
          results.available_to = avails[0].available_to || "";
          results.country_of_origin = avails[0].country_of_origin || "";
          
          cb(null, results);
        } else cb();
      })
    })
  },

  /*
    maps availabilities and brand to product
  */

  get_product_availabilities_and_brand: function (product, cb) {
    var results = {};
    product.getSku(function (err, sku) {
      if (err) return cb(err)
      
      results.available_to = sku.available_to || "";
      results.size = sku.size || "";
      results.ingredients = sku.ingredients || "";
      results.country_of_origin = sku.country_of_origin || "";
      
      sku.getBrand(function(err, brand){
        if (err) return cb(null, "No brand for this sku");
        results.brand = {name:(slug(brand.name)).toLowerCase(), name_external: brand.name};
        sku.getInventory(function (err, inv) {
          //if err then no associated inventory
          if (err) return cb();
          var a4s = inv.availability()
            , available = Math.floor(a4s / product.skus_per);
          results.available = available;
          cb(null, results)
        })
      })
    })
  },

  /* maps availabilities to products
  * OFFERS Controller helpers
   */
  get_sku_data_from_product: function (product, cb) {
    product.getSku(function (err, sku) {
      if (err) return cb(err)

      var results = {};    
      results.available_to = sku.available_to || "";
      results.size = sku.size || "";
      results.ingredients = sku.ingredients || "";
      results.country_of_origin = sku.country_of_origin || "";
      
      sku.getInventory(function (err, inv) {
        if (err) return cb(null, "No Inventory for this SKU");
        var a4s = inv.availability()
          , available = Math.floor(a4s / product.skus_per);
        results.available = available;

        cb(null, results)
      })
    })
  },
  
  /* maps min [product availability] to offer  */
  
  set_offer_data_from_relations: function (offer, cb) {
    offer.getProducts(function (err, products) {
      
      if (err) return cb(err);
      
      async.map(products, module.exports.get_sku_data_from_product, function (err, avails) {
        if (err) return cb()

        if (avails[0]){
          offer.available_for_sale = avails[0].available || "0";
          offer.size = avails[0].size || "";
          offer.ingredients = avails[0].ingredients || "";
          offer.available_to = avails[0].available_to || "";
          offer.country_of_origin = avails[0].country_of_origin || "";

          cb(null, offer);
        } else cb();
      })
    })
  },
///////End OFFERS Controller helpers

/* Products Helpers 
  maps sku.inventory availability / skus_per
*/
  get_availability: function (product, cb) {
     product.getSku(function (err, sku) {
      if (err) return cb(null, "No SKU for this product");  
      sku.getInventory(function (err, inv) {
        if (err) {
          product.available_for_sale = 0;
          sku.available_for_sale = "No Sku_inventory for this SKU";
          product.sku = sku;
          return cb(null, product);
        }      
        var available_for_sale = inv.availability();
        var available = Math.floor(available_for_sale / product.skus_per);
        
        product.available_for_sale = available;
        cb(null, product);
      })
    })
  },
  
///////End PRODUCTS Controller helpers

// SKU Controller helpers

  /*maps availability from inventory */
   
  get_availability_from_inventory: function(sku, cb) {
    sku.getInventory(function (err, inv) {
      if (err){ 
        if (err.message === 'Not found'){
            sku.available_for_sale = "No Sku_inventory for this SKU";
            return cb(null, sku);
          } else return cb(err);
      }
      sku.available_for_sale = inv.availability();
      cb(null, sku);
    })
  },
  
///////End SKUS Controller helpers

  parseQuery: function(request){
  // parse querystring for reserved keys
    var limit = request.query.limit || 25
      , sort = request.query.sort || null
      , page = request.query.page || 1
      , skip;
      
    limit = parseInt(limit);
    if (page) page = parseInt(page);

    if (page > 0) skip = (page - 1) * limit;
    
    var _sort = ['id', 'Z'];
    if (sort) {
      sort = JSON.parse(JSON.stringify(sort))
      if (sort[0] == '-') {
        _sort = []
        _sort.push(sort.substring(1, sort.length))
        _sort.push("Z")
      } else {
        _sort = sort
      }
    }

    // filter
    delete request.query.limit
    delete request.query.page
    delete request.query.sort
    
    return {request: request, sort: _sort, limit: limit, skip: skip};
  
  }
  
  
};
