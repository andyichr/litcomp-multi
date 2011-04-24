var assert = require( "assert" );

function authenticated( req ) {
	// TODO implement
	return false;
}

exports.onRequest = function( req ) {
	
	assert.ok( req.req );
	assert.ok( req.res );
	assert.ok( req.session );

	// exit early if client requested icon
	if ( req.req.url == "/favicon.ico" ) {
		req.res.writeHead( 404 );
		req.res.end();
		return;
	}

	var urlParts = req.req.url.split("/");
	var requestedPath;

	if ( urlParts.length > 2
			&& urlParts[1] == "litcomp-multi" ) {
		requestedPath = "/";
	} else {
		requestedPath = req.req.url;
	}

	req.userSession["requestedPath"] = requestedPath;
	console.log( "set userSession.requestedPath to '" + requestedPath + "'" );

	// TODO add branch where req is proxied to litcomp server if user is authenticated
	if ( authenticated( req ) ) {
		// TODO proxy the request
		console.log( "proxying authenticated request to the application..." );
	} else {
		req.res.writeHead( 302, { "location": "/litcomp-multi/login" } );
		req.res.end();
	}

};
