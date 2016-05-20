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
		html += '<li onclick="socket.emit(\'history\', ' + x.index + ')">' + x.name + '</li>';
	});

	document.querySelector('#online').innerHTML = html;
});

var currentChat;

socket.on('history', function(data) {
	var html = '';
	currentChat = data.to;

	data.history.forEach(function(msg) {
		html += msg + '<br>';
	});
	document.querySelector('#chat').innerHTML = html;
	document.querySelector('#chatHeader').innerHTML = 'Chatting with ' + data.name;
});

socket.on('msg', function(data) {
	if(currentChat !== data.to) {
		return;
	}

	document.querySelector('#chat').innerHTML += data.msg + '<br>';
});
