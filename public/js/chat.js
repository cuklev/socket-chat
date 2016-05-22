(function() {
	var currentChat,
		$online, $offline, $chat, $chatHeader, $chatMessage,
		renderMessage,
		unseen = [];

	renderMessage = (function() {
		// regex WILL need updating
		var urlMatch = /((([A-Za-z]{2,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/g;

		return function(msg) {
			var timestamp = new Date(msg.timestamp);
			msg.msg = msg.msg.replace(urlMatch, '<a href="$1" target="_blank">$1</a>');
			return '<span title="' + timestamp + '"><strong>' + msg.sender + ':</strong> ' + msg.msg + '</span>';
		};
	}());

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
		});

		socket.on('missed', function(missed) {
			for(var i in missed) {
				unseen[i] = missed[i];
				var $el = document.querySelector('#msgs_from_' + i);
				$el.innerHTML = unseen[i];
				$el.style.display = 'inline';
			}
		});

		socket.on('history', function(data) {
			var html = '';

			(function() {
				var $el = document.querySelector('#msgs_from_' + data.to);

				setTimeout(function() {
					unseen[data.to] = 0;
					$el.innerHTML = 0;
					$el.style.display = 'none';

					socket.emit('see', currentChat);
				}, 1000);
			}());

			currentChat = data.to;

			data.history.forEach(function(msg) {
				html += renderMessage(msg) + '<br>';
			});

			$chat.innerHTML = html;
			$chatHeader.innerHTML = 'Chatting with ' + data.name;

			$chat.scrollTop = $chat.scrollHeight;

			$chatMessage.value = '';
			$chatMessage.focus();
		});

		socket.on('msg', function(data) {
			if(currentChat !== data.to) {
				var $el = document.querySelector('#msgs_from_' + data.to);
				if(!unseen.hasOwnProperty(data.to)) {
					unseen[data.to] = 0;
				}
				$el.innerHTML = unseen[data.to] += 1;
				$el.style.display = 'inline';

				return;
			}

			$chat.innerHTML += renderMessage(data.msg) + '<br>';

			$chat.scrollTop = $chat.scrollHeight;

			socket.emit('see', currentChat);
		});
	});
}());
