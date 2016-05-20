'use strict';

let users = [];
let user_ids = {};

function emit(msg, data) {
	users.forEach((x) => {
		if(x.socket === null) {
			return;
		}

		x.socket.emit(msg, data);
	});
};

function userStatus() {
	let data = [];

	users.forEach((x, i) => {
		data.push({
			name: x.name,
			index: i,
			online: x.socket !== null
		});
	});

	return data;
}

function escapeHtml(str) {
	return str.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;'); // What else do I have to escape?
}

function connect(socket) {
	let index;

	socket.on('id', (id) => {
		if(!user_ids.hasOwnProperty(id)) {
			index = users.length;
			user_ids[id] = index;

			users.push({
				socket: socket,
				name: 'Unnamed',
				chats: {}
			});
		}
		else {
			index = user_ids[id];
			users[index].socket = socket;
		}

		socket.emit('name', users[index].name);
		emit('users', userStatus());
	});

	socket.on('name', (name) => {
		name = escapeHtml(name);
		users[index].name = name;
		socket.emit('name', name);
		emit('users', userStatus());
	});

	socket.on('disconnect', () => {
		users[index].socket = null;
		emit('users', userStatus());
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

		let msg = '<strong>' + users[index].name + ':</strong> ' + escapeHtml(data.msg);
		users[index][data.to].push(msg);

		socket.emit('msg', {
			to: data.to,
			msg: msg
		});
		
		if(users[data.to].socket !== null) {
			users[data.to].socket.emit('msg', {
				to: index,
				msg: msg
			});
		}
	});
}

module.exports = {
	connect: connect
};
