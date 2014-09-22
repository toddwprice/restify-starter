var settings    = require('../../config/settings');
var environment = require('../../config/environment');
var routes      = require('../../config/routes');
var bunyan 		= require('bunyan');
var fs 			= require('fs');
var moment		= require('moment');
var path		= require('path');


Restify = require('restify');

exports.StartServer = function(env) {
	//setup logging
	var logPath = settings.logging.path;
	var logDate = new moment().format('YYYY-MM-DD-HHmm');
	var logFilespec = path.join(logPath, "restify-starter-api-" + logDate + ".log");
	console.log(logFilespec);

	if (!fs.existsSync(logPath)) {
		console.log('creating logPath directory: ' + logPath);
		fs.mkdirSync(logPath);
	}

	var log = bunyan.createLogger({
	  name: 'api.restify-starter.local',
	  streams: [
	    {
	      level: (settings.logging.console || 'error'),
	      stream: process.stdout
	    },
	    {
	      level: (settings.logging.file || 'info'),
	      path: logFilespec  
	    }
	  ],
	  serializers: {
            req: bunyan.stdSerializers.req
        }
	});

	var server = Restify.createServer({
		name: 'api.restify-starter.local',
		log: log
	});

	server.pre(function (req, res, next) {
	    req.log.debug({ req: req }, 'REQUEST');
	    next();
	});

	environment(server);
	routes(server);

	server.listen(settings.port, function() {
	  log.info('%s listening at %s', server.name, server.url);
	  log.info('DB host is %s', settings.database.host);
	}).on('error', function (e) {
		log.error('SERVER ERROR', e);
	});
};
