var crypto = require('crypto-js');
module.exports = function(db) {
	return {
		requireAuthentication: function(req, res, next) {
			var token = req.get('auth') || '';
			db.token.findOne({
				where: {
					tokenHash: crypto.MD5(token).toString()
				}
			}).then(function(tokenInstance) {
				if(!tokenInstance) {
					throw new Error();
				}
				req.token = tokenInstance;
				return db.userdetail.findByToken(token);
			})
			.then(function(user) {
					req.user = user;
					next();
			})
			.catch(function() {
				res.status(401).send();
			}); 
		}
	};
};