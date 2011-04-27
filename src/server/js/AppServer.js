var child_process = require( "child_process" );

exports.createAppServer = function( config ) {

	var ifc = {};
	var apps = {};
	var cur_port = 0;
	var start_port = 12000;

	/**
	 * create an application instance once for each unique key
	 * if the application has not yet been started for the key,
	 * an instance will be started up
	 */

	ifc.getApp = function( key, onResult ) {

		// because instance-per-user context is not yet supported, map all
		// keys to a single application instance
		key = "default"; // TODO implement support for multiple keys

		// exit early if app has already been instantiated
		if ( apps[key] ) {
			onResult( undefined, apps[key] );
			return;
		}

		var appIfc = {};
		var app = {};
		apps[key] = appIfc;

		var litcompHome = config["litcomp"]["home"];
		console.log( "spawning litcomp instance using LITCOMP_HOME='" + litcompHome + "'" );
		var cmd = litcompHome + "/bin/litcompd";
		var wikiDir = config["litcomp"]["data"]["provider"]["config"]["path"];
		var port = ( cur_port++ % 1000 ) + start_port;

		console.log( "instantiating application: '" + cmd + "'" );
		var proc = child_process.spawn( cmd, [ litcompHome, wikiDir, port ] );
		app["process"] = proc;

		proc.stdin.write( "OK" );

		proc.stdout.on( "data", function( data ) {
			console.log( "app @ port " + port + " stdout: " + data );
		} );

		proc.stderr.on( "data", function( data ) {
			console.log( "app @ port " + port + " stderr: " + data );
		} );

		// application instance has not yet been started, so start it

		appIfc.getHost = function() {
			return "127.0.0.1";
		};

		appIfc.getPort = function() {
			return port;
		};

		onResult( undefined, appIfc );
	};

	return ifc;
};
