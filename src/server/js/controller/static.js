var fs = require( "fs" );

var getFile = ( function() {
	var files = {};

	return function( fileName, onData, onNotFound ) {
		var file = files[fileName];

		if ( file ) {
			onData( file["data"] );
		} else {
			fs.readFile( "src/client/static/" + fileName.replace( "..", "" ), function( err, data ) {
				if ( err ) onNotFound();
				files[fileName] = {
					data: data
				};
				onData( data );
			} );
		}
	};
}() );

var mimeTypes = {
	"css": "text/css",
	"js": "application/javascript",
	"png": "image/png",
	"jpg": "image/jpeg",
	"default": "application/octet-stream"
};

exports.onRequest = function( req ) {

	var fileNameParts = req.req.url.split( "." );
	var contentType = mimeTypes[fileNameParts[fileNameParts.length-1]];

	if ( ! contentType ) {
		contentType = mimeTypes["default"];
	}

	getFile( req.req.url.substring( new String( "/litcomp-multi/static/" ).length ), function( data ) {
		req.res.writeHead( 200, { "content-type": contentType } );
		req.res.end( data );
	}, function() {
		req.res.writeHead( 404 );
		req.res.end();
	} );
};
