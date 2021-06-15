
delete require.cache[module.filename]; // always reload
const HERE = require("path").dirname( module.filename );

const 	sleepless 			= require("sleepless"),
		L					= require("log5").mkLog("\tmicro: ")(5),
		sleepless_users 	= require( "sleepless-users" );

const CONFIG = {
	database: process.env.DATABASE	|| "micro",
	user:	  process.env.USERNAME	|| "micro",
	password: process.env.PASSWORD	|| "pass",
	host:	  process.env.HOSTNAME	|| "localhost",
}

const q = function(cb) {
	require("db").mysql.connect( CONFIG, function(db) {
		if( ! db ) { L.E("failed to connect to server"); return; }
		cb(db);
	}, err => {
		L.E( err );
		return;
	});
}

const s = function(cb) {
	sleepless_users.connect( "mysql", CONFIG, function(db) {
		if( ! db ) { L.E("failed to connect to server"); return; }
		cb(db);
	}, function(err) {
		L.E( err );
		return;
	});
}

const query = function( method, sql, args, okay, fail ) {
	q( db => {
		db[method]( sql, args, records => {
			db.end();
			okay(records);
		}, err => {
			db.end();
			fail(err);
		});
	});
}
const get_recs = function( sql, args, okay, fail ) { this.query("get_recs", sql, args, okay, fail); }
const get_one = function( sql, args, okay, fail ) { this.query("get_one", sql, args, okay, fail); }
const insert = function( sql, args, okay, fail ) { this.query("insert", sql, args, okay, fail); }
const update = function( sql, args, okay, fail ) { this.query("update", sql, args, okay, fail); }

module.exports = function( input, okay, fail ) {

	const { cmd, msg } = input;

	if( cmd == "ping" ) {
		okay( "pong" );
		return;
	}

	if( cmd == "register" ) {
		let user_id = msg.username;
		msg.data = { user_id };
		s( function(su) {
			su.user.register( msg, okay, fail );
		});
		return;
	}

	if( cmd == "login" ) {
		let user_id = input.username;
		let password = input.password;
		s( function(su) {
			su.user.authenticate( msg, okay, fail );
		});
		return;
	}

	if( cmd == "log" ) {
		log( msg );
		okay();
		return;
	}

	fail( "Invalid action: " + cmd );

};

