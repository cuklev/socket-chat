'use strict';

let users = [];

function emit(msg, data) {
	users.forEach((x) => {
		if(x === undefined) {
			return;
		}

		x.socket.emit(msg, data);
	});
};

function online() {
	let data = [];
	users.forEach((x, i) => {
		if(x === undefined) {
			return;
		}

		data.push({
			name: x.name,
			index: i
		});
	});

	return data;
}

function connect(socket) {
	let index = users.length;
	users.push({
		socket: socket,
		name: 'No name',
		chats: {}
	});

	socket.on('name', (name) => {
		users[index].name = name;
		emit('online', online());
	});

	socket.on('disconnect', () => {
		users[index] = undefined;
		emit('online', online());
	});

	socket.on('history', (to) => {
		if(!users[index].hasOwnProperty(to)) {
			socket.emit('history', {
				to: to,
				name: users[to].name,
				history: [] // No history
			});
			return;
		}

		socket.emit('history', {
			to: to,
			name: users[to].name,
			history: users[index][to]
		});
	});

	socket.on('msg', (data) => {
		if(!users[index].hasOwnProperty(data.to)) {
			users[index][data.to] = [];

			// [from][to] and [to][from] should be the same chats
			users[data.to][index] = users[index][data.to];
		}

		let msg = '<strong>' + users[index].name + ':</strong> '
			+ data.msg.replace(/</g, '&lt;').replace(/>/g, '&gt;'); // What else do I have to escape?
		users[index][data.to].push(msg);

		socket.emit('msg', {
			to: data.to,
			msg: msg
		});
		users[data.to].socket.emit('msg', {
			to: index,
			msg: msg
		});
	});
}

module.exports = {
	connect: connect
};
