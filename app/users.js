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
	users.forEach((x) => {
		if(x === undefined) {
			return;
		}

		data.push(x.name);
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
		emit(online());
	});
}

module.exports = {
	connect: connect
};
