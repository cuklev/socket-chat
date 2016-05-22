(function() {
	var name,
		$reName, $titleName,
		id;

	id = (function() {
		var id_len = 100,
			id = localStorage.getItem('chat_id');

		if(id === null) {
			id = '';
		}

		while(id.length < id_len) {
			id += (Math.random() + '').substr(2);
		}
		id = id.substr(0, id_len);

		localStorage.setItem('chat_id', id);
		return id;
	}());

	function loadHistory() {
		if(location.hash === '') {
			return;
		}

		var index = +location.hash.substr(1);
		socket.emit('history', index);
	}

	window.addEventListener('load', function() {
		$reName = document.querySelector('#reName');
		$titleName = document.querySelector('#titleName');

		socket.emit('id', id);

		loadHistory(); // should happen after emitting id
		window.addEventListener('hashchange', loadHistory);

		$reName.addEventListener('keyup', function(e) {
			socket.emit('name', $reName.value);
		});

		socket.on('name', function(data) {
			name = data;
			$titleName.innerHTML = name;
		});
	});
}());
