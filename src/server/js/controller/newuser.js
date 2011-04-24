exports.onRequest = function( req ) {

	// present login screen
	req.res.writeHead( 200, { "content-type": "text/html" } );

	req.getTemplate( "header", function( headerSrc ) {
		req.res.write( headerSrc );

		req.getTemplate( "newuser", function( newuserSrc ) {
			req.res.write( newuserSrc );

			req.getTemplate( "recaptcha", function( recaptchaSrc ) {
				req.res.write( recaptchaSrc );

				req.res.write( "<script>var serverData = " );

				req.res.write( JSON.stringify( {
					"errorMessage": req.userSession["captchaErrorMessage"]
				} ) );

				req.res.write( "</script>" );

				delete req.userSession["captchaErrorMessage"];

				req.getTemplate( "footer", function( footerSrc ) {
					req.res.write( footerSrc );
					req.res.end();
				} );
			} );
		} );
	} );

};
