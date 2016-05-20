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

socket.on('online', function(users) {
	var html = '';
	users.forEach(function(x) {
		html += '<li>' + x.name + '</li>';
	});

	document.querySelector('#online').innerHTML = html;
});

socket.on('history', function(x) {
	console.log(x);
});

socket.on('msg', function(x) {
	console.log(x);
});
