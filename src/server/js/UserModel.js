var fs = require( "fs" );

exports.createUserModel = function( config ) {

	var ifc = {};
	var dataDir = config["litcomp-multi"]["data"]["provider"]["config"]["path"] + "/users";

	try {
		fs.mkdirSync( dataDir, 755 );
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
