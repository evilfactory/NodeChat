const io = require("socket.io")(3001)
var colors = require('colors');
const readline = require('readline');


var users = {}

var chatMessages = []

function ReturnDataAndLog(msg, r, g, b) {

	chatMessages.push(chatData(msg, r, g, b))

	if (chatMessages.length > 100) {
		chatMessages.splice(0, 1)
	}

	return chatData(msg, r, g, b)
}

function chatData(msg, r, g, b) {
	var data = {
		m: msg,
		c: { r: r, g: g, b: b }
	}

	return data
}

function userData(name, r, g, b) {
	var data = {
		name: name,
		color: { r: r, g: g, b: b }
	}

	return data
}

io.on('connection', function (socket) {
	console.log("User connected: ".green + socket.id.cyan);

	socket.on("authenticate", function (data) {
		if (users[socket.id] != null) { return }

		if (data.name == null || data.color.r == null || data.color.g == null || data.color.b == null || data.name.toLowerCase() == "server") {
			users[socket.id] = userData(socket.id, 255, 255, 255)
		} else {
			users[socket.id] = userData(data.name, data.color.r, data.color.g, data.color.b)
		}

		io.emit('msg', ReturnDataAndLog(users[socket.id].name + " Join", 0, 255, 0))

		socket.emit("datafromserver", chatMessages)
	})

	socket.on('send', function (data) {
		if (users[socket.id] == null) { return }

		console.log(users[socket.id].name.cyan + ": " + data.m)

		var split = data.m.split(" ")
		var command = split.shift()

		io.emit("msg", ReturnDataAndLog(users[socket.id].name + ": " + data.m, users[socket.id].color.r, users[socket.id].color.g, users[socket.id].color.b));

		if(command == "!help"){
			io.emit("msg", ReturnDataAndLog("Server: Commands: !help, !name and !color", 0, 255, 255))
		}

		if (command == "!name") {
			if (split.join(" ").length > 20) {
				io.emit("msg", ReturnDataAndLog("Server: Name too long", 0, 255, 255))

				console.log(users[socket.id].name.cyan + " tried to change name, but name is too long haha".red)
			} else if(split.join(" ").length < 3) {
				io.emit("msg", ReturnDataAndLog("Server: Name too short", 0, 255, 255))

				console.log(users[socket.id].name.cyan + " tried to change name, but name is too short haha".red)
			
			}else{

				if(split.join(" ").toLowerCase() == "server"){
					io.emit("msg", ReturnDataAndLog("Server: No.", 255, 0, 0))
					console.log("Server: No.".red)

					return;
				}

				console.log(users[socket.id].name.cyan + " changed your name to " + split.join(" ").cyan)

				io.emit("msg", ReturnDataAndLog("Server: Name changed", 0, 255, 255))

				users[socket.id].name = split.join(" ")

				socket.emit("updatecookie", users[socket.id])

			}
		}
		if (command == "!color") {

			if (split[0] == null || split[1] == null || split[2] == null) {
				console.log(users[socket.id].name.cyan + " tried to change color, but color is invalid".red)

				io.emit("msg", ReturnDataAndLog("Server: Invalid color", 0, 255, 255))

			} else {

				console.log(users[socket.id].name.cyan + " changed your color to " + split.join(" ").cyan)

				io.emit("msg", ReturnDataAndLog("Server: Color changed", 0, 255, 255))

				users[socket.id].color.r = parseInt(split[0])
				users[socket.id].color.g = parseInt(split[1])
				users[socket.id].color.b = parseInt(split[2])

				socket.emit("updatecookie", users[socket.id])

			}
		}

		if(command == "!html"){
			io.emit("sendhtml", split.join(" "))
		}

	})


	socket.on('disconnect', function () {
		if (users[socket.id] == null) { return }

		socket.broadcast.emit("msg", ReturnDataAndLog(users[socket.id].name + " Disconnected", 255, 0, 0));

		users[socket.id] = null

	})

})

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (answer) => {
	io.emit("msg", ReturnDataAndLog("Server: "+answer, 0, 255, 255))
	console.log("Server".cyan+": "+answer.magenta)
})