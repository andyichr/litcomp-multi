var fs = require( "fs" );
var https = require( "https" );
var httpProxy = require('http-proxy');
var util = require( "util" );
var querystring = require( "querystring" );
var openid = require( "openid" );
var Cookies = require( "cookies" );

var mail = require( "./mail.js" );
var SessionModel = require( "./SessionModel.js" );
var UserModel = require( "./UserModel.js" );
var AppServer = require( "./AppServer.js" );

fs.readFile( process.argv[2], function( err, data ) {
	var config = JSON.parse( data );

	var getTemplate = ( function() {
		var templates = {};

		fs.readdir( "src/client/html", function( err, files ) {
			for ( var i = 0; i < files.length; i ++ ) {
				var file = files[i];

				if ( file.substring( file.length - (new String( ".html" ) ).length ) == ".html" ) {
					var templateNameParts = file.split( "/" );
					var templateName = templateNameParts[templateNameParts.length-1].substring( 0, templateNameParts[templateNameParts.length-1].length - ( new String( ".html" ) ).length );
					templates[templateName] = {
						"path": "src/client/html/" + templateName + ".html"
					};
					console.log( "registered template: '" + templateName + "'" );
				}
			}
		} );

		return function( templateName, onData ) {
			var template = templates[templateName];

			if ( template["src"] ) {
				onData( template["src"] );
			} else {
				fs.readFile( template["path"], function( err, data ) {
					if ( err ) throw err;
					template[templateName] = data;
					onData( data );
				} );
			}
		};
	}() );

	var session = SessionModel.createSessionModel();
	var userModel = UserModel.createUserModel( config );
	var appServer = AppServer.createAppServer( config );

	console.log( "scanning for controllers..." );

	var controllers = {};

	////////////////////////////////////////////////////////////////////////////////
	// scan for servers and then create the http server
	////////////////////////////////////////////////////////////////////////////////
	fs.readdir( "src/server/js/controller", function( err, files ) {
		if ( err ) throw err;

		for ( var filesIdx = 0; filesIdx < files.length; filesIdx++ ) {
			var file = files[filesIdx];

			if ( file.substring( file.length-3 ) == ".js" ) {
				var controllerName = file.substring( 0, file.length-3 );
				console.log( "registered controller: '" + controllerName + "'" );
				controllers[controllerName] = require( "./controller/" + controllerName + ".js" );
			}

		}

		var options = {
			key: fs.readFileSync( config["litcomp-multi"]["ssl"]["key"] ),
			cert: fs.readFileSync( config["litcomp-multi"]["ssl"]["cert"] )
		};

		var server = https.createServer( options, function ( req, res ) {

			console.log( "serving request: " + req.url );
			var urlParts = req.url.split("/");
			var controller;

			if ( urlParts.length > 2
					&& urlParts[1] == "litcomp-multi" ) {
				var fileParts = urlParts[2].split( "?" );
				console.log( "attempting to use controller: " + fileParts[0] );
				controller = controllers[fileParts[0]];
			}

			if ( ! controller ) {
				console.log( "no controller found; using default" );
				controller = controllers["default"];
			}

			var cookies = new Cookies( req, res );
			var sid = cookies.get( "litcomp-multi-sid" );

			if ( !sid || ( new String( sid ) ).length < 10  ) {
				sid = session.newKey();
				cookies.set( "litcomp-multi-sid", sid );
			}

			console.log( "Handling request with sid: '" + sid + "'" );

			var userSession = session.getSession( sid );

			controller.onRequest( {
				config: config,
				mail: mail,
				req: req,
				res: res,
				cookies: cookies,
				userSession: userSession,
				session: session,
				userModel: userModel,
				getTemplate: getTemplate,
				appServer: appServer
			} );
		} );

		server.on( "upgrade", function( req, socket, head ) {
			// if user is authenticated, proxy websockets request to application
			var cookies = new Cookies( req );
			var sid = cookies.get( "litcomp-multi-sid" );
			var userSession = session.getSession( sid );

			var proxy = new httpProxy.HttpProxy();
			var buffer = proxy.buffer( req );

			if ( ! (
					sid
					&& userSession
					&& userSession["authorized"]
				) ) {

				console.log( "rejected connection upgrade because user is not authenticated" );
				return;
			}

			console.log( "proxying connection upgrade for authorized user: " + userSession["user"]["email"] );
			
			appServer.getApp( userSession["user"]["email"], function( err, userApp ) {
				var host = userApp.getHost();
				var port = userApp.getPort();
				proxy.proxyWebSocketRequest( req, socket, head, {
					host: host,
					port: port,
					buffer: buffer
				} );
			} );
		} );

		var LISTEN_PORT = config["litcomp-multi"]["port"];

		if (!LISTEN_PORT) {
			LISTEN_PORT = 8071;
		}

		server.listen( LISTEN_PORT );

		console.log( "using port: " + LISTEN_PORT );
		console.log( "server listening at '" + config["litcomp-multi"]["base-url"] + "'" );

	} );
} );
