exports.onRequest = function( req ) {

	// present login screen
	req.res.writeHead( 200, { "content-type": "text/html" } );
	req.getTemplate( "header", function( headerSrc ) {
		req.res.write( headerSrc );

		req.getTemplate( "login", function( loginSrc ) {
			req.res.write( loginSrc );
			req.res.write( "<script>var serverData = " );

			req.res.write( JSON.stringify( {
				"errorMessage": req.userSession["errorMessage"]
			} ) );

			req.res.write( "</script>" );

			delete req.userSession["errorMessage"];

			req.getTemplate( "footer", function( footerSrc ) {
				req.res.write( footerSrc );
				req.res.end();
			} );
		} );
	} );

};
