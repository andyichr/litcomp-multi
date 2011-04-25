var util = require( "util" );

exports.onRequest = function( req ) {

	var urlParts = req.req.url.split( "/" );
	var userAction = urlParts[3];
	var reqArg = urlParts[4];

	if ( ( ! req.userSession["authorized"] )
		|| ( ! req.userSession["user"]["admin"] ) ) {

		req.userSession["requestedPath"] = req.req.url;
		req.userSession["errorMessage"] = "Only an authorized admin may do that. If you are an admin, sign in first.";
		req.res.writeHead( 302, { "location": "/litcomp-multi/login" } );
		req.res.end();
		return;
	}

	switch ( userAction ) {

	case "approve":
		var approveUserKey = reqArg;
		req.userModel.approve( approveUserKey, function( err ) {
			if ( err ) {
				console.log( "error while attempting to approve user: " + err );
				req.res.writeHead( 302, { "location": "/litcomp-multi/admin_error" } );
				req.res.end();
			} else {
				req.res.writeHead( 302, { "location": "/litcomp-multi/admin_success" } );
				req.res.end();
			}
		} );
		break;

	case "promote":
		var promoteUserKey = reqArg;
		req.userModel.promote( promoteUserKey, function( err ) {
			if ( err ) {
				console.log( "error while attempting to promote user: " + err );
				req.res.writeHead( 302, { "location": "/litcomp-multi/admin_error" } );
				req.res.end();
			} else {
				req.res.writeHead( 302, { "location": "/litcomp-multi/admin_success" } );
				req.res.end();
			}
		} );
		break;

	case "remove":
		var removeUserKey = reqArg;
		req.userModel.remove( removeUserKey, function( err ) {
			if ( err ) {
				console.log( "error while attempting to remove user: " + err );
				req.res.writeHead( 302, { "location": "/litcomp-multi/admin_error" } );
				req.res.end();
			} else {
				req.res.writeHead( 302, { "location": "/litcomp-multi/admin_success" } );
				req.res.end();
			}
		} );
		break;

	default:
		req.res.writeHead( 404 );
		req.res.end();
		break;
	}

};
