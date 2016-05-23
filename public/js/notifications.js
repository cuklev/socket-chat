var notifications = (function() {
	var unseen = {};

	socket.on('missed', function(missed) {
		for(var i in missed) {
			unseen[i] = missed[i];
		}
	});

	function display(to) {
		var $el = document.querySelector('#msgs_from_' + to);

		if(unseen[to] === 0) {
			$el.innerHTML = '';
			$el.style.display = 'none';
		}
		else {
			$el.innerHTML = unseen[to];
			$el.style.display = 'inline';
		}
	}

	function displayAll() {
		for(var i in unseen) {
			notifications.display(i);
		}
	}

	function increment(to) {
		unseen[to] = (unseen[to] || 0) + 1;
		display(to);
	}

	function clear(to) {
		unseen[to] = 0;
		display(to);
	}

	return {
		display: display,
		displayAll: displayAll,
		increment: increment,
		clear: clear
	};
}());
