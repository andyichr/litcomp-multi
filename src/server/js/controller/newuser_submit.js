var querystring = require( "querystring" );
var url = require( "url" );

var Recaptcha = require('recaptcha').Recaptcha;

function error( req, msg ) {
	console.log( "user failed to verify captcha" );
	req.res.writeHead( 302, { "location": "/litcomp-multi/newuser" } );
	req.res.end();
	req.userSession["captchaErrorMessage"] = msg;
	return;
}

exports.onRequest = function( req ) {

	var postData = "";

	req.req.on( "data", function( data ) {
		postData += data;
	} );

	req.req.on( "end", function() {
		var post = querystring.parse( postData );
		var captchaData = {
			remoteip: req.req.connection.remoteAddress,
			challenge: post["recaptcha_challenge_field"],
			response: post["recaptcha_response_field"]
		};
		var recaptcha = new Recaptcha( req.config["litcomp-multi"]["recaptcha"]["key"]["public"],
				req.config["litcomp-multi"]["recaptcha"]["key"]["private"], captchaData );

		recaptcha.verify( function( success, error_code ) {

			if ( success ) {
				// save new user data and send admin email
				req.userModel.createUser( {
					"email": req.userSession["openidResult"]["http://axschema.org/contact/email"],
					"name": {
						"first": req.userSession["openidResult"]["http://axschema.org/namePerson/first"],
						"last": req.userSession["openidResult"]["http://axschema.org/namePerson/last"]
					},
					"openid": [
						req.userSession["openidResult"]["claimedIdentifier"]
					]
				}, function( user ) {
					if ( user ) {
						req.userModel.saveUser( user["email"], user, function( err ) {
							console.log( "user saved; sending email to admin" );
						} );
					} else {
						console.log( "error occurred while saving new user in newuser_submit controller" );
					}
				} );

				req.res.writeHead( 200, { "content-type": "text/plain" } );
				req.res.end( "OK" );
			} else {
				error( req, "CAPTCHA verification failed" );
			}

		} );
	} );

};
