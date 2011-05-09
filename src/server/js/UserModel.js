var fs = require( "fs" );
var util = require( "util" );

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
		return ( ("" + key).replace( /\//g, "" ) );
	};

	ifc.getUser = function( key, onResult ) {
		key = sanitizeKey( key );
		fs.readFile( dataDir + "/" + key + ".js", function( err, data ) {
			if ( err ) {
				console.log( "error (possibly harmless) while reading user data: '" + err + "'" );
				onResult( undefined );
			} else {
				var user = JSON.parse( data );
				onResult( user );
			}
		} );
	};

	ifc.iterateAdminUsers = function( onAdminUser, onEnd ) {
		ifc.iterateUsers( function( thisUser ) {
			if ( thisUser && thisUser["admin"] ) {
				onAdminUser( thisUser );
			}
		}, function() {
			onEnd();
		} );
	};

	ifc.iterateUsers = function( onUser, onEnd ) {

		var numReading = 0;
		var finalNumReading = undefined;

		ifc.iterateUserKeys( function( userKey ) {
			var cont = true;
			numReading++;

			ifc.getUser( userKey, function( thisUser ) {
				numReading--;

				cont = onUser( thisUser );

				if ( typeof ( finalNumReading != 'undefined' ) ) {
					finalNumReading--;

					if ( finalNumReading == 0 ) {
						onEnd();
					}
				}
			} );

			return cont;
		}, function() {
			finalNumReading = numReading;

			if ( finalNumReading == 0 ) {
				onEnd();
			}

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

				if ( file.substring( file.length - ( new String( ".js" ) ).length ) == ".js" ) {
					cont = onUserKey( file.substring( 0, file.length - ( new String( ".js" ) ).length ) );
				}
			}

			onEnd();
		} );
	};

	ifc.getKeyHavingOpenID = function( openID, onResult ) {
		var found = false;
		
		ifc.iterateUsers( function( thisUser ) {
			var openIDs = thisUser["openid"];

			for ( var i = 0; i < openIDs.length; i++ ) {

				if ( openIDs[i] == openID ) {
					found = true;
					onResult( thisUser["email"] );
					return false;
				}
			}

			return true;
		}, function() {

			if ( !found ) {
				onResult( undefined );
			}

		} );
	};

	ifc.validateUser = function( user, onValid, onNotValid ) {
		// TODO implement actual validation routine
		onValid();
	};

	ifc.approve = function( userKey, onResult ) {
		ifc.getUser( userKey, function( user ) {
			if ( ! user ) {
				onResult( "user not found" );
				return;
			}

			user["approved"] = true;

			ifc.saveUser( userKey, user, function( err ) {
				onResult( err );
			} );
		} );
	};

	ifc.promote = function( userKey, onResult ) {
		ifc.getUser( userKey, function( user ) {
			if ( ! user ) {
				onResult( "user not found" );
				return;
			}

			user["admin"] = true;

			ifc.saveUser( userKey, user, function( err ) {
				onResult( err );
			} );
		} );
	};

	ifc.createUser = function( newUser, onResult ) {
		newUser["approved"] = false;
		ifc.validateUser( newUser, function() {
			onResult( newUser );
		}, function() {
			onResult( undefined );
		} );
	};

	ifc.saveUser = function( key, user, onResult ) {
		ifc.validateUser( user, function() {
			fs.writeFile( dataDir + "/" + sanitizeKey( key ) + ".js", JSON.stringify( user ), function( err ) {
				if ( err ) {
					console.log( "error encountered in UserModel.saveUser while attempting to save user: '" + err + "'" );
				}

				onResult( err );
			} );
		}, function() {
			console.log( "UserModel.saveUser was invoked with an invalid user; user will not be saved" );
		} );
	}

	ifc.remove = function( key, onResult ) {
		fs.unlink( dataDir + "/" + sanitizeKey( key ) + ".js", function( err ) {
			onResult( err );
		} );
	};

	ifc.userExists = function( key, onResult ) {
		fs.stat( dataDir + "/" + key, function( err, stat ) {
			if ( err ) onResult( false );
			else onResult( true );
		} );
	};

	return ifc;
};
