var bcrypt = require('bcrypt');
var _ = require('underscore');
var crypto = require('crypto-js');
var jwt = require('jsonwebtoken');
module.exports = function(sequelize, dataTypes){

	var user = sequelize.define('userdetail', {
		surname: {
			type: dataTypes.STRING,
			allowNull: false,
			validaye: {
				len: [4, 250]
			}
		},
		email: {
			type: dataTypes.STRING,
			allowNull: false,
			unique:true,
			validate: {
				isEmail:true
			}
		},
		salt: {
			type: dataTypes.STRING
		},
		password_hash: {
			type: dataTypes.STRING
		},
		password: {
			type: dataTypes.STRING,
			allowNull: false,
			validate: {
				len: [ 7 , 16 ],
				is: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/i
			},
			set: function(value) {
					var salt = bcrypt.genSaltSync(10);
					var hashedPassword = bcrypt.hashSync(value , salt);
					this.setDataValue('password', value);
					this.setDataValue('salt', salt);
					this.setDataValue('password_hash', hashedPassword);
				}
			
		},
		mobile: {
			type: dataTypes.INTEGER,
			allowNull: false,
			validate: {
				len : [10, 15],
				isInt: true,
				isNumeric: true
			}
		},
		Zip: {
			type: dataTypes.INTEGER,
			allowNull: false,
			validate: {
				len : [5, 8],
				isInt: true,
				isNumeric: true
			}
		},
		city: {
			type: dataTypes.STRING,
			allowNull: false,
			validate: {
				len: [4, 250]
			}
		},
		state: {
			type: dataTypes.STRING,
			allowNull: false,
			validate: {
				len: [4, 250]
			}
		},
		country: {
			type: dataTypes.STRING,
			allowNull: false,
			validate: {
				len: [4, 250]
			}
		},

	},
	{
		hooks: {
			beforeValidate: function(user, options) {
				if(typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},

		classMethods: {

			authenticate: function(body) {
				return new Promise(function(resolve, reject) {
					if(typeof body.email !== 'string' || typeof body.password !== 'string') {
						return reject();
					} 

					db.userdetail.findOne({
						where : {
							email: body.email
						}
					}).then(function(user) {
					
						if(!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
							return reject();
						} else {
							resolve(user);
						}

					}, function(e) {
						reject();
					});
				});
			},
			findByToken: function(token) {
				return new Promise(function(resolve, reject) {
					try {
						var decodedJWT = jwt.verify(token, 'qwerty007');
						var bytes = crypto.AES.decrypt(decodedJWT.token, 'abc123@');
						var tokenData = JSON.parse(bytes.toString(crypto.enc.Utf8));
						user.findById(tokenData.id).then(function(user) {
							if(user) {
								resolve(user);
							} else {
								reject();
							}
						}, function() {
							reject();
						}); 
					} catch (e) {
						console.log(e);
						return reject();
					}
				});
			}

		},
		
		instanceMethods: {
				toPublicJSON: function() {
					var json = this.toJSON();
					return _.pick(json, 'id','surname','email','mobile','Zip','city','state','country','createdAt','updatedAt');
				},

				generateToken: function(type) {
					if (!_.isString(type)) {
						return undefined;
						}
					try {
							var stringData = JSON.stringify({id: this.get('id'), type: type});
							var encryptedString = crypto.AES.encrypt(stringData, 'abc123@').toString();	
							var token = jwt.sign({
									token: encryptedString
								},'qwerty007');
							return token;
						} catch(e) {
							console.log(e);
						}
				}
		}
	});

	return user;
}