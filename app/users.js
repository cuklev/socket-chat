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
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
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
				chats: {},
				seen: {}
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
		(function() {
			let missed = {};
			for(let i in users[index].chats) {
				missed[i] = users[index].chats[i].length - (users[index].seen[i] || 0);
			}

			socket.emit('missed', missed);
		}());
		emit('users', userStatus());
	});

	socket.on('name', (name) => {
		if(index === undefined) {
			return;
		}

		name = escapeHtml(name.trim());
		if(name === '') {
			name = '"no name"';
		}

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

		socket.emit('history', {
			to: to,
			name: users[to].name,
			history: users[index].chats[to] || [],
			seen: users[index].seen[to] || 0,
			old: users[to].seen[index] || 0
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
		users[index].seen[data.to] = users[index].chats[data.to].length;

		socket.emit('msg', {
			to: data.to,
			msg: msg,
			seen: true,
			old: false
		});

		if(users[data.to].socket !== null) {
			users[data.to].socket.emit('msg', {
				to: index,
				msg: msg,
				seen: false,
				old: true
			});
		}
	});

	socket.on('see', (to) => {
		if(index === undefined) {
			return;
		}

		if(!users[index].chats.hasOwnProperty(to)) {
			return;
		}
		users[index].seen[to] = users[index].chats[to].length;

		if(users.hasOwnProperty(to) && users[to].socket !== null) {
			users[to].socket.emit('see', index);
		}
	});
}

module.exports = {
	connect: connect
};
