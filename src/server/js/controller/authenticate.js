var querystring = require( "querystring" );
var openid = require('openid');
var url = require('url');

var extensions = [new openid.AttributeExchange( {
	"http://axschema.org/contact/email": "required",
	"http://axschema.org/namePerson/first": "required",
	"http://axschema.org/namePerson/last": "required"
} )];

function error( res, inputOpenid ) {
	console.log( "error encountered with inputOpenid: '" + inputOpenid + "'" );
	res.writeHead( 302, { "location": "/litcomp-multi/login" } );
	res.end();
	return;
}

exports.onRequest = function( req ) {

	var verifyUrl = req.config["litcomp-multi"]["base-url"] + "/litcomp-multi/verify";
	console.log( "using verification URL: '" + verifyUrl + "'" );
	var relyingParty = new openid.RelyingParty(
			verifyUrl, // Verification URL (yours)
			null, // Realm (optional, specifies realm for OpenID authentication)
			false, // Use stateless verification
			false, // Strict mode
			extensions); // List of extensions to enable and include
	req.userSession["relyingParty"] = relyingParty;

	var postData = "";

	req.req.on( "data", function( data ) {
		postData += data;
	} );

	req.req.on( "end", function() {
		var post = querystring.parse( postData );
		var inputOpenid = post["openid"];
		console.log( "got openid authenticate request from user: '" + inputOpenid + "'" );

		if ( ! inputOpenid ) {
			return error( req.res, inputOpenid );
		}

		relyingParty.authenticate( inputOpenid, false, function( authUrl ) {
			if ( ! authUrl ) {
				return error( req.res, inputOpenid );
			}

			req.res.writeHead( 302, { "location": authUrl } );
			req.res.end();
		} );
	} );

};
