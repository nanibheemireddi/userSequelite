var express = require('express');
var bcrypt = require('bcrypt');
var _ = require('underscore');
var bodyParser = require('body-parser');
var app = express();
var PORT = 8080;
var db = require('./db.js');
var middleware = require('./middleware.js')(db);
var userdetails = [];
var userNextId = 1;
app.use(bodyParser.json());

 app.get('/users',middleware.requireAuthentication, function(req,res){
 	var query = req.query;

 	where = {};
 	if (query.hasOwnProperty("un")) {
 		where.surname = {
 			$like: '%' + query.un + '%'
 		};
 	}

 	if(query.hasOwnProperty("email")) {
 		where.email = {
 			$like: "%" + query.email + '%'
 		}
 	}

 	if(query.hasOwnProperty("mobile")) {
 		where.mobile = query.mobile; 
 	}

 	if(query.hasOwnProperty("zip")) {
 		where.Zip = query.zip;
 	}

 	if(query.hasOwnProperty("city")) {
 		where.city = query.city;
 	}

 	if(query.hasOwnProperty("state")) {
 		where.state = query.state;
 	}

 	if(query.hasOwnProperty("country")) {
 		where.country = query.country;
 	}

 	db.userdetail.findAll({where: where}).then(function(users) {
 		if(Object.keys(users).length > 0) {
 			res.json(users);	
 		} else {
 			res.status(404).json({'error' : 'data not found'});
 		}
 	}).catch(function(e) {
 		res.status(500).send(e);
 	});
 });
 
 app.get('/users/:id',middleware.requireAuthentication, function(req, res){
 	var userid = parseInt(req.params.id, 10);
 	db.userdetail.findById(userid).then(function(user) {
 		if(user) {
 			res.json(user.toJSON());	
 		} else {
 			res.status(404).json({'error' :'data not found'});
 		}
 	},function(e) {
 		res.status(400).send(e);
 	});
 });

app.post('/users', function(req, res) {

	var body = _.pick(req.body, 'surname','email','password','mobile','Zip','city','state','country');
	db.userdetail.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	},function(e) {
		res.status(400).send(e);
	});
});


app.post('/users/login', function(req,res) {
	var body =  _.pick(req.body, 'email', 'password');
	var userInstance;
	db.userdetail.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		userInstance = user;
		return db.token.create({
			token: token
		});
		
		}).then(function(tokenInstance) {
			res.header('auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
			}).catch(function(e) {
			res.status(401).send();
			});
});


app.delete('/users/:id', function(req, res) {
		var userid = parseInt(req.params.id, 10);
		db.userdetail.destroy({
			where: {
				id: userid
			}
		}).then(function(user) {
			if(user) {
				res.json(user);
			} else {
				res.status(404).json({'error': 'match not found'});
			}
		},function(e) {
			res.status(500).send(e);
		});
	});

app.post('/users/logout', middleware.requireAuthentication, function(req, res) {

		
		req.token.destroy().then(function() {
			res.status(204).send();
		},function() {
			res.satus(500).send();
		});
});

app.post('/customlogout', middleware.requireAuthentication, function(req, res) {
		res.status(200).json({'success' : "Logout"});
});

app.put('/users/:id',middleware.requireAuthentication, function(req, res) {
		var userid = parseInt(req.params.id, 10);
		var body = _.pick(req.body,'surname','email','password','mobile','Zip','city','state','country' );
		var attributes = {};

		if(body.hasOwnProperty("surname")) {
			attributes.surname = body.surname.trim(); 
		}
		if(body.hasOwnProperty("email")) {
			attributes.email = body.email.trim(); 
		}
		if(body.hasOwnProperty("password")) {
			attributes.password = body.password; 
		}
		if(body.hasOwnProperty("mobile")) {
			attributes.mobile = body.mobile; 
		}
		if(body.hasOwnProperty("Zip")) {
			attributes.Zip = body.Zip; 
		}
		if(body.hasOwnProperty("city")) {
			attributes.city = body.city.trim(); 
		}
		if(body.hasOwnProperty("status")) {
			attributes.state = body.status.trim(); 
		}
		if(body.hasOwnProperty("country")) {
			attributes.country = body.country.trim(); 
		}

		db.userdetail.findById(userid).then(function(user) {
			if(user) {
				user.update(attributes).then(function(user) {
					res.json(user.toJSON());
				},function(e) {
					res.status(400).json(e);
				});
			} else {
				res.status(404).json({'error':'not found'});
			}
		},function(e) {
			res.status(500).send(e);
		});
	});


app.get('/todos', middleware.requireAuthentication, function(req, res) {

 	var query = req.query;
 	var where = {
 		userdetailId : req.user.get('id')
 	};


 	if (query.hasOwnProperty("completed")) {
 		if (query.completed === "true") {
 						where.completed = true;
 	
 		} else if (query.completed === "false") {
 		 		where.completed = false;
 		 	}
 	}

	if (query.hasOwnProperty("desc") && query.desc.length > 0) {
		where.description = {
			$like: '%' + query.desc + '%'
		};
	}
	
	db.todo.findAll({where: where}).then(function (todos) {
		res.json(todos);
	},function() {
		res.status(500).json('{error: error in server connection}');
	});

});



app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	where = {
		id : todoId,
		userdetailId : req.user.get('id')
	};


	db.todo.findOne({where: where}).then(function (todo) {
		if(todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).json('{error: data not found}');
		}
	}).catch(function () {
		res.status(500).json("{error: server not found}");
	});
	
});



app.post('/todos', middleware.requireAuthentication, function(req, res) {

	var body = _.pick(req.body, "description", "completed");
	db.todo.create(body).then(function (todo) {
		req.user.addTodo(todo).then(function() {
			return todo.reload();
		}).then(function(todo) {
				res.json(todo.toJSON());
			});
	}, function(e) {
		res.status(400).send(e);
	});
});




app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
 var todoId = parseInt(req.params.id, 10);
 where = {
 		id: todoId,
 		userdetailId: req.user.get('id') 
 	};

 db.todo.destroy({where: where}).then(function(rowsDeleted) {
 		if(rowsDeleted === 0) {
 			res.status(404).json('{error: data not found }')
 		} else {
 			res.status(204).send();
 		}
 },function() {
 	res.status(500).json('{error: server not found}');
 });

}); 


app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, "description", "completed");
	var attributes = {};
	where = {
 		id: todoId,
 		userdetailId: req.user.get('id') 
 	};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}
	
	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	} 

	db.todo.findOne({where: where}).then(function(todo) {
		if(todo) {
			 todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			},function() {
				res.status(400).json({'error': 'input missing'});
			});
		} else {
			res.status(404).json({'error':'data not found'});
		}
	},function(e) {
		res.status(500).send(e);
	});
});
	

db.sequelize.sync({force: true}).then(function() {
	app.listen(PORT, function() {
		console.log('express server is started on ' + PORT);
	});
});
