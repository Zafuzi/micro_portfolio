var templates = {
	login: null,
	loginButton: null,
	logoutButton: null,
	register: null,
	sid: null
}

var SID;

document.addEventListener("DOMContentLoaded", dcl => {
	Object.keys(templates).forEach( function(k) {
		templates[k] = rplc8(`r8[name='${k}']`);
	});

	rpc(API, {cmd: "ping"}, function(r) {
		console.log(r);
	}, console.error);

	let qd = getQueryData();
	if( ! qd.page ) jmp("/?page=home");
	Nav(qd, data => {
		SID = localStorage.getItem("sid")
		if( SID ) {
			templates.loginButton.update([]);
			templates.logoutButton.update([{sid: SID}]);
		} else {
			templates.loginButton.update([{sid: SID}]);
			templates.logoutButton.update([]);
		}
		document.body.style.opacity = 0;

		// wait until opacity setting above is done local.css defines as 300ms
		setTimeout( function() {

			document.querySelectorAll(".page").forEach(p => {
				p.style.display = "none";
				if( p.id == "page_" + data.page ) {
					p.style.display = "";
				}
			});

			document.body.scrollIntoView()

			let func = window[`nav_${data.page}`];
			typeof(func) == "function" ? func(() => {
				document.body.style.opacity = 1;
			}, data) : console.error(`nav_${data.page} is not a function`);

		}, 300); // local.css body>transition>opacity 300ms
	});
});

function nav_home(cb) {
	templates.sid.update([{sid: SID || null}]);
	cb();
}

function nav_logout(cb, data) {
	localStorage.removeItem("sid");
	rpc(API, { cmd: "logout", msg: data, sid: SID }, console.log, console.error);
	jmp("/?page=home");
}

function nav_login(cb, data) {
	templates.login.update([{ error: o2j(data?.error) || "" }], function(e, d, i) {
		e.addEventListener("submit", function(event) {
			event.preventDefault();
			let data = event.target.getData();
			rpc(API, {
				cmd: "login",
				msg: data
			}, function( r ) {
				if( r ) {
					localStorage.setItem("sid", r );
				}
				jmp(`/?page=home`);
			}, function( err ) {
				jmp(`/?page=login&error=${o2j(err)}`);
			});
		});
	});
	cb();
}

function nav_register(cb, data) {
	templates.register.update([{ error: o2j(data?.error) || "" }], function(e, d, i) {
		e.addEventListener("submit", function(event) {
			event.preventDefault();
			let data = event.target.getData();
			rpc(API, {
				cmd: "register",
				msg: data
			}, function( r ) {
				if( r ) {
					localStorage.setItem("sid", r );
				}
				jmp(`/?page=home`);
			}, function( err ) {
				jmp(`/?page=register&error=${o2j(err)}`);
			});
		});
	});
	cb();
}
