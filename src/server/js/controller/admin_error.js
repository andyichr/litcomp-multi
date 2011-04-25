exports.onRequest = function( req ) {

	// present login screen
	req.res.writeHead( 200, { "content-type": "text/html" } );
	req.getTemplate( "header", function( headerSrc ) {
		req.res.write( headerSrc );

		req.getTemplate( "admin_error", function( admin_errorSrc ) {
			req.res.write( admin_errorSrc );

			req.getTemplate( "footer", function( footerSrc ) {
				req.res.write( footerSrc );
				req.res.end();
			} );
		} );
	} );

};
