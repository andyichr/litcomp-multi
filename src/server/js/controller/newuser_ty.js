exports.onRequest = function( req ) {

	// present login screen
	req.res.writeHead( 200, { "content-type": "text/html" } );
	req.getTemplate( "header", function( headerSrc ) {
		req.res.write( headerSrc );

		req.getTemplate( "newuser_ty", function( newuser_tySrc ) {
			req.res.write( newuser_tySrc );

			req.getTemplate( "footer", function( footerSrc ) {
				req.res.write( footerSrc );
				req.res.end();
			} );
		} );
	} );

};
