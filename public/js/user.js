(function() {
	var name,
		$reName, $titleName;

	window.addEventListener('load', function() {
		$reName = document.querySelector('#reName');
		$titleName = document.querySelector('#titleName');

		if(name === undefined) {
			name = 'Unnamed';
		}
		$reName.value = name;
		$titleName.innerHTML = name;
		socket.emit('name', $reName.value);

		$reName.addEventListener('keyup', function(e) {
			socket.emit('name', $reName.value);
		});

		socket.on('name', function(data) {
			name = data;
			$titleName.innerHTML = name;
		});
	});
}());
