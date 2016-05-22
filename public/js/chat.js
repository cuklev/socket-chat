(function() {
	var currentChat,
		$online, $offline, $chat, $chatHeader, $chatMessage;

	window.addEventListener('load', function() {
		$online = document.querySelector('#online');
		$offline = document.querySelector('#offline');
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
			if($chatMessage.value === '') {
				return;
			}

			socket.emit('msg', {
				to: currentChat,
				msg: $chatMessage.value
			});

			$chatMessage.value = '';
		});

		socket.on('users', function(users) {
			var onhtml = '', offhtml = '';

			users.forEach(function(x) {
				var title = 'Logged in from: ' + x.ip + '\n' + x.userAgent,
					onclick = 'socket.emit(\'history\', ' + x.index + ')';
					html = '<li title="' + title + '" onclick="' + onclick + '">' + x.name + '</li>';

				if(x.online) {
					onhtml += html;
				}
				else {
					offhtml += html;
				}
			});

			$online.innerHTML = onhtml;
			$offline.innerHTML = offhtml;
		});

		socket.on('history', function(data) {
			var html = '';
			currentChat = data.to;

			data.history.forEach(function(msg) {
				html += msg + '<br>';
			});

			$chat.innerHTML = html;
			$chatHeader.innerHTML = 'Chatting with ' + data.name;

			$chat.scrollTop = $chat.scrollHeight;

			$chatMessage.value = '';
			$chatMessage.focus();
		});

		socket.on('msg', function(data) {
			if(currentChat !== data.to) {
				return;
			}

			$chat.innerHTML += data.msg + '<br>';

			$chat.scrollTop = $chat.scrollHeight;
		});
	});
}());
