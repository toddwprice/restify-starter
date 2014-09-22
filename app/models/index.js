var orm = require('orm');
var settings = require('../../config/settings');
var connection = null;

function setup(db, cb) {

  /*
   defines a custom data type :
   `textArray` maps to psql `text []` type
   */
  db.defineType('textArray', {
    datastoreType: function (prop) {
      return 'text []'
    },

    valueToProperty: function (value, prop) {
      if (Array.isArray(value)) {
        return value;
      } else {
        if (value) {
          return value.split(',').map(function (v) {
            return String(v);
          });
        } else {
          return null;
        }
      }
    },

    propertyToValue: function (value, prop) {
      return value.join(',');
    }
  });


  /* ==================================================================
   Post
  */
  var Post = db.define('post', {
    title: {type: 'text'},
    post_date: {type: 'date', time: true},
    is_deleted: {type: 'boolean'}
  });



  /* ==================================================================
   Comment
  */
  var Comment = db.define('comment', {
    comment_text: {type: 'text'},
    comment_date: {type: 'date', time: true},
    is_deleted: {type: 'boolean'}
  });

  Comment.hasOne('post', Post, {reverse: 'comments'});

  db.sync(function(err) {
    if (err) { console.log('sync error:' , err); }
    return cb(null, db);  
  });
}

module.exports = function (cb) {
  if (connection) return cb(null, connection);

  orm.connect(settings.database, function (err, db) {
    if (err) return cb(err);

    connection = db;
    db.settings.set('instance.returnAllErrors', true);
    setup(db, cb);
  });
};

