$( function() {
	var openIdProviders = [
		{
			"name": "Google",
			"image": "google.png",
			"endpoint": "https://www.google.com/accounts/o8/id"
		},
		{
			"name": "Yahoo",
			"image": "yahoo.png",
			"endpoint": "https://me.yahoo.com"
		},
		{
			"name": "MyOpenID",
			"image": "myopenid.png",
			"endpoint": "http://myopenid.com/"
		},
	];
	$( "#google-button" ).click( function() {
	} );

	$( "#openid_list" ).each( function( i, openIdListEl ) {
		var $openIdList = $( openIdListEl );
		$( openIdProviders ).each( function( i, openIdProvider ) {
			$openIdList.append(
				$( "<a/>" )
					.click( function() {
						$( "#openid-input" ).val( openIdProvider["endpoint"] );
						$( "#submit-button" ).click();
					} ).append(
						$( "<img/>" ).attr( "src", "/litcomp-multi/static/img/" + openIdProvider["image"] )
					)
			);
		} );
	} );

	if ( serverData && serverData["errorMessage"] ) {
		var $errorDiv = $( "<div class=\"error\"/>" ).text( serverData["errorMessage"] ).fadeIn() 
		$errorDiv.click( function() {
			$errorDiv.remove();
		} );
		$( "body" ).append( $errorDiv );
	}
} );
