var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/data/user-api.sqlite'
});

db = {};

db.userdetail = sequelize.import(__dirname + '/models/use.js');
db.todo = sequelize.import(__dirname + '/models/todo.js');
db.token = sequelize.import(__dirname + '/models/token.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.todo.belongsTo(db.userdetail);
db.userdetail.hasMany(db.todo);

module.exports = db;