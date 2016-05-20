(function() {
	var name,
		$reName, $titleName;

	var id = (function() {
		var id_len = 100,
			id = localStorage.getItem('chat_id');
		if(id === null) {
			id = '';
			while(id.length < id_len) {
				id += (Math.random() + '').substr(2);
			}
			id = id.substr(0, id_len);
		}
		localStorage.setItem('chat_id', id);
		return id;
	}());

	window.addEventListener('load', function() {
		$reName = document.querySelector('#reName');
		$titleName = document.querySelector('#titleName');

		socket.emit('id', id);

		$reName.addEventListener('keyup', function(e) {
			socket.emit('name', $reName.value);
		});

		socket.on('name', function(data) {
			name = data;
			$reName.value = name;
			$titleName.innerHTML = name;
		});
	});
}());
