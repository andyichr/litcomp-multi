var querystring = require( "querystring" );
var url = require( "url" );
var util = require( "util" );

function error( res, error ) {
	console.log( "error encountered with openid authentication: '" + error + "'" );
	res.writeHead( 302, { "location": "/litcomp-multi/login" } );
	res.end();
	return;
}

exports.onRequest = function( req ) {

	var relyingParty = req.userSession["relyingParty"];

	relyingParty.verifyAssertion( req.req, function( result ) {
		if ( result.authenticated ) {
			console.log( "user authenticated: '" + result.claimedIdentifier + "'" );
			req.res.writeHead( 200, { "content-type": "text/plain" } );
			req.res.end( "AUTHENTICATED" );
		} else {
			req.res.writeHead( 302, { "location": "/litcomp-multi/login" } );
			req.res.end();
			console.log( "user was not authenticated" );
		}
	} );
};
