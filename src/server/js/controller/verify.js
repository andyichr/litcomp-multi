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

	if ( ! relyingParty ) {
		relyingParty = {};
	}

	if ( ! relyingParty.verifyAssertion ) {
		relyingParty.verifyAssertion = function( req, onResult ) {
			onResult( {
				authenticated: false
			} );
		};
	}

	relyingParty.verifyAssertion( req.req, function( result ) {
		if ( result.authenticated ) {
			console.log( "user authenticated: '" + result.claimedIdentifier + "'" );

			var userKey = result["http://axschema.org/contact/email"];

			var onUnrecognizedUser = function() {
				// openid is not recognized; present user with captcha and add in
				// a new unapproved user
				console.log( "encountered unrecognized user: '" + userKey + "'" );
				req.userSession["openidResult"] = result;
				req.res.writeHead( 302, { "location": "/litcomp-multi/newuser" } );
				req.res.end();
			};

			var onRecognizedUser = function() {

				// the openid has been associated with an approved user; consider this user logged-in
				console.log( "encountered recognized user: '" + userKey + "'" );
				var redirectTo = req.userSession["requestedPath"] || "/";
				console.log( "redirecting user to: '" + redirectTo + "'" );
				req.userSession["authorized"] = true;
				req.res.writeHead( 302, { "location": redirectTo } );
				req.res.end();
			};

			// see if there exists a user with this openid
			req.userModel.getKeyHavingOpenID( result.claimedIdentifier, function( userKey ) {
				if ( userKey ) {
					req.userModel.getUser( userKey, function( user ) {
						if ( user && user["approved"] ) {
							onRecognizedUser();
						} else {
							onUnrecognizedUser();
						}
					} );
				} else {
					onUnrecognizedUser();
				}
			} );

		} else {
			req.res.writeHead( 302, { "location": "/litcomp-multi/login" } );
			req.res.end();
			req.userSession["errorMessage"] = "OpenID provider reported failed authentication.";
			console.log( "user was not authenticated" );
		}
	} );
};
