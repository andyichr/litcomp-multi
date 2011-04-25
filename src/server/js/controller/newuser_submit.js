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

							var approveUser = req.config["litcomp-multi"]["base-url"] + "/litcomp-multi/user/approve/" + user["email"];
							var promote = req.config["litcomp-multi"]["base-url"] + "/litcomp-multi/user/promote/" + user["email"];
							var remove = req.config["litcomp-multi"]["base-url"] + "/litcomp-multi/user/remove/" + user["email"];

							var message = "A new user has requested an application account at "
									+ req.config["litcomp-multi"]["base-url"] + ": \n\n"
									+ "Email: '" + user["email"] + "'\n"
									+ "First Name: '" + user["name"]["first"] + "'\n"
									+ "Last Name: '" + user["name"]["last"] + "'\n\n"
									+ "Approval:\n\n  To approve this user, visit " + approveUser + "\n\n"
									+ "Promote:\n\n  To promote this user to admin status, visit " + promote + "\n\n"
									+ "Remove:\n\n To remove this user from the application, visit " + remove + "\n\n";

							req.userModel.iterateAdminUsers( function( user ) {
								req.mail.send( {
									"to": user["email"],
									"subject": user["email"] + " Requests Application Account at "
											+ req.config["litcomp-multi"]["base-url"],
									"message": message
								} );
							}, function() {
								// nothing to do here
							} );
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
