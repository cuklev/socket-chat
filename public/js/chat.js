(function() {
	var currentChat,
		$online, $offline, $chat, $chatHeader, $chatMessage,
		renderMessage,
		windowfocus = false;

	renderMessage = (function() {
		// regex WILL need updating
		var urlMatch = /((([A-Za-z]{2,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/g;

		return function(msg, seen) {
			var $msg = document.createElement('div'),
				timestamp = new Date(msg.timestamp);

			$msg.title = timestamp;
			if(!seen) {
				$msg.className = 'newMessage';
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

	window.addEventListener('focus', function() {
		windowfocus = true;
		seeChat();
	});
	window.addEventListener('blur', function() {
		windowfocus = false;
	});

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
					notification = '<span id="msgs_from_' + x.index + '" class="notification"></span>',
					html = '<li title="' + title + '"><a href="#' + x.index + '">' + x.name + '</a>' + notification + '</li>';

				if(x.online) {
					onhtml += html;
				}
				else {
					offhtml += html;
				}
			});

			$online.innerHTML = onhtml;
			$offline.innerHTML = offhtml;

			notifications.displayAll();
		});

		socket.on('history', function(data) {
			currentChat = data.to;

			notifications.clear(data.to);

			$chat.innerHTML = '';
			data.history.forEach(function(msg, i) {
				renderMessage(msg, i < data.seen);
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

			renderMessage(data.msg, data.seen);

			$chat.scrollTop = $chat.scrollHeight;

			if(!data.seen && windowfocus) {
				seeChat();
			}
		});
	});
}());
