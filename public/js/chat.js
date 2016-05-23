(function() {
	var currentChat,
		$users, $chat, $chatHeader, $chatMessage,
		renderMessage,
		windowfocus = false;

	renderMessage = (function() {
		// regex WILL need updating
		var urlMatch = /((([A-Za-z]{2,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/g;

		return function(msg, seen, old) {
			var $msg = document.createElement('div'),
				timestamp = new Date(msg.timestamp);

			$msg.title = timestamp;
			if(!seen) {
				$msg.className = 'newMessage';
			}
			else if(!old) {
				$msg.className = 'pendingMessage';
			}

			msg.msg = msg.msg.replace(urlMatch, '<a href="$1" target="_blank">$1</a>');

			$msg.innerHTML = '<strong>' + msg.sender + ':</strong> ' + msg.msg;
			$chat.appendChild($msg);
		};
	}());

	function seeChat() {
		var i, $msgs = document.querySelectorAll('.newMessage');
		for(i in $msgs) {
			$msgs[i].className = 'highlight';
		}

		socket.emit('see', currentChat);
	}

	function seenChat() {
		var i, $msgs = document.querySelectorAll('.pendingMessage');
		for(i in $msgs) {
			$msgs[i].className = 'highlight';
		}
	}

	window.addEventListener('focus', function() {
		windowfocus = true;
		seeChat();
	});
	window.addEventListener('blur', function() {
		windowfocus = false;
	});

	window.addEventListener('load', function() {
		$users = document.querySelector('#usersList');
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
			var html = '';

			users.forEach(function(x) {
				var title = 'L' + (x.online ? '' : 'ast l') + 'ogged in from: ' + x.ip + '\n' + x.userAgent, // insert time if offline
					notification = '<span id="msgs_from_' + x.index + '" class="notification"></span>',
					href = '<a href="#' + x.index + '">' + x.name + '</a>',
					$li = '<li title="' + title + '" class="' + (x.online ? 'online' : 'offline') + '">' + href + notification + '</li>';

				html += $li;
			});

			$users.innerHTML = html;
			console.log($users);
			console.log(html);

			notifications.displayAll();
		});

		socket.on('history', function(data) {
			currentChat = data.to;

			notifications.clear(data.to);

			$chat.innerHTML = '';
			data.history.forEach(function(msg, i) {
				renderMessage(msg, i < data.seen, i < data.old);
			});

			$chatHeader.innerHTML = 'Chatting with ' + data.name;

			$chat.scrollTop = $chat.scrollHeight;

			$chatMessage.value = '';
			$chatMessage.focus();

			if(windowfocus) {
				seeChat();
			}
		});

		socket.on('msg', function(data) {
			if(!data.seen) {
				util.beep();
			}

			if(currentChat !== data.to) {
				notifications.increment(data.to);
				return;
			}

			renderMessage(data.msg, data.seen, data.old);

			$chat.scrollTop = $chat.scrollHeight;

			if(!data.seen && windowfocus) {
				seeChat();
			}
		});

		socket.on('see', function(to) {
			if(currentChat !== to) {
				return;
			}

			seenChat();
		});
	});
}());
