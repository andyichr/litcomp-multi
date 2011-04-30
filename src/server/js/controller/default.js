var assert = require( "assert" );
var httpProxy = require('http-proxy');

function authenticated( req ) {
	return req.userSession["authorized"];
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

	// req is proxied to litcomp server if user is authenticated
	if ( authenticated( req ) ) {
		console.log( "proxying authenticated request to the application..." );
		var proxy = new httpProxy.HttpProxy();
		var buffer = proxy.buffer( req.req );
		req.appServer.getApp( req.userSession["user"]["email"], function( err, userApp ) {
			var host = userApp.getHost();
			var port = userApp.getPort();
			proxy.proxyRequest( req.req, req.res, {
				host: host,
				port: port,
				buffer: buffer
			} );
		} );
	} else {
		console.log( "user is not authenticated, so forwarding to login screen" );
		req.res.writeHead( 302, { "location": "/litcomp-multi/login" } );
		req.res.end();
	}

};
