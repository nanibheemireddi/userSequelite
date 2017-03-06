var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var db = require('./db.js');

var PORT = 8080;

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('this is for postman program');
});



app.get('/todos', function(req, res) {

 	var query = req.query;
 	var where = {};
// 	var filteredtodo = todos;

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



app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function (todo) {
		if(todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).json('{error: data not found}');
		}
	}).catch(function () {
		res.status(500).json("{error: server not found}");
	});
	
});



app.post('/todos', function(req, res) {

	var body = _.pick(req.body, "description", "completed");
	db.todo.create(body).then(function (todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).send(e);
	});
});




app.delete('/todos/:id', function(req, res) {
 var todoId = parseInt(req.params.id, 10);

 db.todo.destroy({
 	where: {
 		id:todoId
 	}
 }).then(function(rowsDeleted) {
 		if(rowsDeleted === 0) {
 			res.status(404).json('{error: data not found }')
 		} else {
 			res.status(204).send();
 		}
 },function() {
 	res.status(500).json('{error: server not found}');
 });

}); 


app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, "description", "completed");
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}
	
	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	} 

	db.todo.findById(todoId).then(function(todo) {
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
	
db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('express server is started on ' + PORT);
	});
});