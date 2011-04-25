var fs = require( "fs" );

exports.createUserModel = function( config ) {

	var ifc = {};
	var dataDir = config["litcomp-multi"]["data"]["provider"]["config"]["path"] + "/users";

	try {
		fs.mkdirSync( dataDir, 0755 );
	} catch( e ) {
		console.log( "error while creating UserModel data dir: '" + e + "' --this may be harmless" );
	}

	console.log( "UserModel is using path '" + dataDir + "' for data persistence" );

	var sanitizeKey = function( key ) {
		return ( "" + key ).replace( ".", "" );
	};

	ifc.getUser = function( key, onResult ) {
		key = sanitizeKey( key );
		fs.readFile( dataDir + "/" + key, function( err, data ) {
			if ( err ) throw err;
			var user = JSON.decode( data );
			onResult( user );
		} );
	};

	ifc.iterateUserKeys = function( onUserKey, onEnd ) {
		var cont = true;

		fs.readdir( dataDir, function( err, files ) {
			if ( err ) {
				console.log( "error in UserModel.iterateUserKeys: " + err );
			}

			for ( var i = 0; i < files.length && cont; i++ ) {
				var file = files[i];

				if ( file.substring( 0, file.length - ( new String( ".js" ) ).length ) == ".js" ) {
					cont = onUserKey( file );
				}
			}

			onEnd();
		} );
	};

	ifc.getKeyHavingOpenID = function( openID, onResult ) {
		var found = false;
		
		ifc.iterateUserKeys( function( thisUserKey ) {
			var thisUser = ifc.getUser( thisUserKey );
			var openIDs = thisUser["openid"];

			for ( var i = 0; i < openIDs.length; i++ ) {
				if ( openIDs[i] == openID ) {
					onResult( thisUser["email"] );
					found = true;
					return false;
				}
			}

			return true;
		}, function() {
			if ( ! found ) {
				onResult( undefined );
			}
		} );
	};

	ifc.saveUser = function( key, user, onResult ) {
	}

	ifc.rmUser = function( key, onResult ) {
	};

	ifc.userExists = function( key, onResult ) {
		fs.stat( dataDir + "/" + key, function( err, stat ) {
			if ( err ) onResult( false );
			else onResult( true );
		} );
	};

	return ifc;
};
