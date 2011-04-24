var Recaptcha = require( "recaptcha" ).Recaptcha;

exports.onRequest = function( req ) {

	var recaptcha = new Recaptcha( req.config["litcomp-multi"]["recaptcha"]["key"]["public"],
			req.config["litcomp-multi"]["recaptcha"]["key"]["private"] );

	req.res.writeHead( 200, { "content-type": "text/html" } );

	req.getTemplate( "header", function( headerSrc ) {
		req.res.write( headerSrc );

		req.getTemplate( "newuser", function( newuserSrc ) {
			req.res.write( newuserSrc );
			req.res.write( "<div id=\"recap\">" );
			req.res.write( recaptcha.toHTML() );
			req.res.write( "</div>" );

			req.res.write( "<script>\nvar serverData = " );

			req.res.write( JSON.stringify( {
				"errorMessage": req.userSession["captchaErrorMessage"],
			} ) );

			req.res.write( ";\n</script>\n" );

			delete req.userSession["captchaErrorMessage"];

			req.getTemplate( "footer", function( footerSrc ) {
				req.res.write( footerSrc );
				req.res.end();
			} );
		} );
	} );

};
