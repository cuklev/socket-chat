var socket = (function() {
	var path = window.location.pathname
		.replace(/index\.html$/, '')
		.replace(/\/$/, '')
		+ '/socket.io';
	return io({path: path});
}());

socket.on('disconnect', function() {
	alert('Server went offline');
	location.reload();
});
