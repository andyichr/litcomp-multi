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
		return ( "" + key.replace( /\//g, "" ) );
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
		var numChecking = 0;
		var finalNumChecking = undefined;
		
		ifc.iterateUserKeys( function( thisUserKey ) {
			numChecking++;
			ifc.getUser( thisUserKey, function( thisUser ) {
				numChecking--;
				var openIDs = thisUser["openid"];

				for ( var i = 0; i < openIDs.length; i++ ) {

					if ( openIDs[i] == openID ) {
						found = true;
						onResult( thisUser["email"] );
						return false;
					}
				}

				if ( typeof( finalNumChecking ) != "undefined"
						&& finalNumChecking == 0
						&& ! found ) {
					onResult( undefined );
				}

				return true;
			} );
		}, function() {
			finalNumChecking = numChecking;

			if ( finalNumChecking == 0 ) {
				onResult( undefined );
			}
		} );
	};

	ifc.validateUser = function( user, onValid, onNotValid ) {
		// TODO implement actual validation routine
		onValid();
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
