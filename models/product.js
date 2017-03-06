module.exports = function(sequelize, dataTypes){

	return sequelize.define('product', {
		productName: {
			type: dataTypes.STRING,
			allowNull: false,
			validate: {
				len :[1,250]
			}
		},
		
		Description: {
			type: dataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1, 250]
			}
		},
		
		Quantity: {
			type: dataTypes.INTEGER,
			allowNull: false,	
			validate: {
				isNumeric: true,
				isInt: true
			}	
		},

		productPrice: {
			type: dataTypes.INTEGER,
			allowNull: false,
			validate: {
				isNumeric: true,
				isInt:true
			}
		}
	});
}