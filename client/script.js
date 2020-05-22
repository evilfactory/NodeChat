const socket = io("http://localhost:3001");

function debugRemoveCookies(){ // haha no cookies for you
	setCookie("name", "", 32);
	setCookie("rcolor", "", 32);
	setCookie("gcolor", "", 32);
	setCookie("bcolor", "", 32);
}

function chatData(msg, r, g, b) {
	var data = {
		m: msg,
		c: { r: r, g: g, b: b }
	}
	return data
}

function userData(name, r,g,b){
    var data = {
    	name: name, 
    	color: {r:r, g:g, b:b}
	}

    return data
}

var formo = document.getElementById("message")
var msginputo = document.getElementById("msgtosend");

if(getCookie("name") == ""){
	socket.emit("authenticate", { name: null })
}else{
	socket.emit("authenticate", userData(getCookie("name"), parseInt(getCookie("rcolor")),parseInt(getCookie("gcolor")),parseInt(getCookie("bcolor"))))
}


socket.on("datafromserver", function (data) {
	console.log(data)
	for (var i = 0; i < data.length; i++) {
		addmsg(data[i])
	}
})

socket.on("updatecookie", function(data){
	setCookie("name", data.name, 32);
	setCookie("rcolor", data.color.r, 32);
	setCookie("gcolor", data.color.g, 32);
	setCookie("bcolor", data.color.b, 32);
})

socket.on("msg", function (data) {
	addmsg(data);
	console.log(data)
})


// while true go brrrrrrrrrrrrrrrrrr
socket.on("sendhtml", function(data){

	var divo = document.createElement("div");
	divo.innerHTML = data
	document.getElementById("msgcontainer").append(divo);

	var div = document.getElementById("msgcontainer");
	div.scrollTop = div.scrollHeight - div.clientHeight;
})


formo.addEventListener("submit", e => {
	e.preventDefault();
	const msg = msginputo.value;

	socket.emit("send", chatData(msg, 255, 255, 255));

	msginputo.value = ""
})

function addmsg(data) {
	var divo = document.createElement("div");
	divo.innerText = data.m
	document.getElementById("msgcontainer").append(divo);
	divo.style.color = `rgb( ${data.c.r}, ${data.c.g}, ${data.c.b} )`

	var div = document.getElementById("msgcontainer");
	div.scrollTop = div.scrollHeight - div.clientHeight;
}

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}