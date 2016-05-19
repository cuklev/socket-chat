var socket = (function() {
	var path = window.location.pathname
		.replace(/index\.html$/, '')
		.replace(/\/$/, '')
		+ '/socket.io';
	return io({path: path});
}());
