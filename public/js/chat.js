(function() {
	var currentChat,
		$online, $chat, $chatHeader, $chatMessage;

	window.addEventListener('load', function() {
		$online = document.querySelector('#online');
		$chat = document.querySelector('#chat');
		$chatHeader = document.querySelector('#chatHeader');
		$chatMessage = document.querySelector('#chatMessage');

		$chatMessage.addEventListener('keyup', function(e) {
			if(e.which !== 13) {
				return;
			}
			if(currentChat === undefined) {
				return;
			}

			socket.emit('msg', {
				to: currentChat,
				msg: $chatMessage.value
			});

			$chatMessage.value = '';
		});

		socket.on('online', function(users) {
			var html = '';
			users.forEach(function(x) {
				html += '<li onclick="socket.emit(\'history\', ' + x.index + ')">' + x.name + '</li>';
			});

			$online.innerHTML = html;
		});

		socket.on('history', function(data) {
			var html = '';
			currentChat = data.to;

			data.history.forEach(function(msg) {
				html += msg + '<br>';
			});
			$chat.innerHTML = html;
			$chatHeader.innerHTML = 'Chatting with ' + data.name;
		});

		socket.on('msg', function(data) {
			if(currentChat !== data.to) {
				return;
			}

			$chat.innerHTML += data.msg + '<br>';
		});
	});
}());
