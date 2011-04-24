$( function() {
	var $errorDiv = $( "#errormsg" );
	if ( serverData && serverData["errorMessage"] ) {
		$errorDiv.replaceWith( $( "<div class=\"errormsg\"/>" ).text( serverData["errorMessage"] ).fadeIn() );
		$errorDiv.click( function() {
			$errorDiv.remove();
		} );
	} else {
		$errorDiv.remove();
	}
} );
