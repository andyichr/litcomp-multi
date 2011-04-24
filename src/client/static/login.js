$( function() {
	$( "#google-button" ).click( function() {
		$( "#openid-input" ).val( "https://www.google.com/accounts/o8/id" );
		$( "#submit-button" ).click();
	} );

	if ( serverData && serverData["errorMessage"] ) {
		var $errorDiv = $( "<div class=\"error\"/>" ).text( serverData["errorMessage"] ).fadeIn() 
		$errorDiv.click( function() {
			$errorDiv.remove();
		} );
		$( "body" ).append( $errorDiv );
	}
} );
