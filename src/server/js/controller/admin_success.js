exports.onRequest = function( req ) {

	// present login screen
	req.res.writeHead( 200, { "content-type": "text/html" } );
	req.getTemplate( "header", function( headerSrc ) {
		req.res.write( headerSrc );

		req.getTemplate( "admin_success", function( admin_successSrc ) {
			req.res.write( admin_successSrc );

			req.getTemplate( "footer", function( footerSrc ) {
				req.res.write( footerSrc );
				req.res.end();
			} );
		} );
	} );

};
