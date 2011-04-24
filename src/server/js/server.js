var fs = require( "fs" );
var http = require( "http" );
var util = require( "util" );
var querystring = require( "querystring" );
var openid = require( "openid" );
var Cookies = require( "cookies" );

var SessionModel = require( "./SessionModel.js" );

var getTemplate = ( function() {
	var templates = {
		"header": {
			"path": "src/client/html/header.html"
		},
		"footer": {
			"path": "src/client/html/footer.html"
		},
		"login": {
			"path": "src/client/html/login.html"
		}
	};

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

console.log( "scanning for controllers..." );

var controllers = {};

////////////////////////////////////////////////////////////////////////////////
// scan for servers and then create the http server
////////////////////////////////////////////////////////////////////////////////
fs.readdir( "src/server/js/controller", function( err, files ) {
	if ( err ) throw err;

	for ( var filesIdx = 0; filesIdx < files.length; filesIdx++ ) {
		var file = files[filesIdx];

		console.log( "ext:" );
		if ( file.substring( file.length-3 ) == ".js" ) {
			var controllerName = file.substring( 0, file.length-3 );
			controllers[controllerName] = require( "./controller/" + controllerName + ".js" );
		}

	}

	var server = http.createServer( function ( req, res ) {

		var urlParts = req.url.split("/");
		var controller;

		if ( urlParts.length > 2
				&& urlParts[1] == "litcomp-multi" ) {
			controller = controllers[urlParts[2]];
		}

		if ( ! controller ) {
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
			req: req,
			res: res,
			cookies: cookies,
			userSession: userSession,
			session: session,
			getTemplate: getTemplate
		} );
	} );

	server.listen( 8071 );

} );
