var fs = require( "fs" );
var http = require( "http" );
var util = require( "util" );
var querystring = require( "querystring" );
var openid = require( "openid" );
var Cookies = require( "cookies" );

var SessionModel = require( "./SessionModel.js" );

var templateSrc = ( function() {
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
				onData( data );
			} );
		}
	};
}() );

function authenticated( req ) {
	// TODO implement
	return false;
}

function authenticate( req, res, onFail ) {

	if ( req.method != "POST" ) {
		return onFail();
	}

	var postQueryString = "";

	req.on( "data", function( chunk ) {
		postQueryString += chunk;
	} );

	req.on( "end", function() {
		postData = querystring.parse( postQueryString );
		console.log( util.inspect( postData ) );

		return onFail();
	} );
}

var session = SessionModel.createSessionModel();

var server = http.createServer( function ( req, res ) {

	var cookies = new Cookies( req, res );
	var sid = cookies.get( "litcomp-multi-sid" );

	if ( !sid || ( new String( sid ) ).length < 10  ) {
		sid = session.newKey();
		cookies.set( "litcomp-multi-sid", sid );
	}

	console.log( "Handling request with sid: '" + sid + "'" );

	var userSession = session.getSession( sid );

	// TODO add branch where req is proxied to litcomp server if user is authenticated
	if ( authenticated( req ) ) {
		// TODO proxy the request
	} else {

		// process authentication attempt
		if ( authenticate( req, res, function() {

			// present login screen
			res.writeHead( 200, { "content-type": "text/html" } );
			templateSrc( "header", function( headerSrc ) {
				res.write( headerSrc );

				templateSrc( "login", function( loginSrc ) {
					res.write( loginSrc );

					templateSrc( "footer", function( footerSrc ) {
						res.write( footerSrc );
						res.end();
					} );
				} );
			} );

		} ) );
	}

} );

server.listen( 8071 );
