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
			online: x.socket !== null,
			ip: x.ip,
			userAgent: x.userAgent
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

		// Check to see if this works behind multiple proxies
		users[index].ip = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
		users[index].userAgent = socket.request.headers['user-agent'];

		socket.emit('name', users[index].name);
		emit('users', userStatus());
	});

	socket.on('name', (name) => {
		if(index === undefined) {
			return;
		}

		name = escapeHtml(name);
		users[index].name = name;
		socket.emit('name', name);
		emit('users', userStatus());
	});

	socket.on('disconnect', () => {
		if(index === undefined) {
			return;
		}

		users[index].socket = null;
		emit('users', userStatus());
	});

	socket.on('history', (to) => {
		if(index === undefined) {
			return;
		}

		if(!users.hasOwnProperty(to)) {
			return;
		}

		if(!users[index].chats.hasOwnProperty(to)) {
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
			history: users[index].chats[to]
		});
	});

	socket.on('msg', (data) => {
		if(index === undefined) {
			return;
		}

		if(!users.hasOwnProperty(data.to)) {
			return;
		}

		data.msg = data.msg.trim();
		if(data.msg === '') {
			return;
		}

		if(!users[index].chats.hasOwnProperty(data.to)) {
			users[index].chats[data.to] = [];

			// [from][to] and [to][from] should be the same chats
			users[data.to].chats[index] = users[index].chats[data.to];
		}

		let msg = {
			sender: users[index].name, // Don't store by name
			msg: escapeHtml(data.msg),
			timestamp: new Date()
		};
		users[index].chats[data.to].push(msg);

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
