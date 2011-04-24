exports.createSessionModel = function() {
	var sessions = {};
	var timeouts = {};

	var ifc = {};

	ifc.getSession = function( key ) {
		if ( typeof( sessions[key] ) == "undefined" ) {
			sessions[key] = {};
		}

		return sessions[key];
	};

	ifc.setSession = function( key, value ) {
		sessions[key] = value;

		if ( timeouts[key] ) {
			clearTimeout( timeouts[key] );
		}

		// delete session after one week
		timeouts[key] = setTimeout( function() {
			if ( sessions[key] ) {
				delete sessions[key];
				delete timeouts[key];
			}
		}, 604800000 );
	};

	ifc.newKey = function() {
		var key = "";

		for ( var i = 0; i < 4; i++ ) {
			key = Math.random() + key;
			key = key.substring( 2 );
		}

		return key;
	};

	return ifc;
};
