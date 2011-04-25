var child_process = require( "child_process" );

exports.send = function( message ) {
	var mailProc = child_process.spawn( "mail", [ "-s", message.subject, message.to ] );
	console.log( "sending email to '" + message.to + "'" );
	mailProc.stdin.end( message.message );
	mailProc.stdout.on( "data", function( data ) {
		console.log( "mail stdout: " + data );
	} );
	mailProc.stderr.on( "data", function( data ) {
		console.log( "mail stderr: " + data );
	} );
};
