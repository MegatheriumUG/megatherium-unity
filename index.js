var async = require('async'),
	qs = require('querystring'),
	request = require('request');

var unity = {};

// Klasse für Tests
unity.Test = function(options) {
	this.options = options;
	this.cases = [];
	this.currentError = null;
	this.currentResponse = null;
};

/**
 * Fügt Test-Cases hinzu.
 *
 * @param cases	Array[]	die Test-Cases in Array-Struktur
 */
unity.Test.prototype.add = function(cases) {
	this.cases = this.cases.concat(cases);
	return this;
};

/**
 * Führt Anfragen auf den Server aus.
 *
 * @param controller	String	der Endpunkt; z.B. "POST UserAdd" oder "GET UserList"
 * @param data	Object	die zu übermittelnden Parameter
 * @param callback	Function	wird aufgerufen, wenn die Anfrage ausgeführt wurde
 * 								callback(err, response)
 */
unity.Test.prototype.request = function(controller, data, callback) {
	controller = controller.split(' ');
	if (controller[0] == 'GET' && Object.keys(data).length > 0) {
		controller[1] += '?'+qs.stringify(data);
	}

	request(this.options.serverUrl+controller[1], {method: controller[0], form: controller[0] == 'POST' ? data : null}, function(err, response) {
		this.currentError = err;
		this.currentResponse = response.body;
		callback(err, response.body && response.body.charAt(0) == '{' ? JSON.parse(response.body) : response);
	}.bind(this));
};

/**
 * Führt die Test-Cases nacheinander aus.
 *
 * @param callback	Function	wird aufgerufen, wenn alle Test-Cases ausgeführt wurden
 *								callback(errMsg, errDetails)
 */
unity.Test.prototype.run = function(callback) {
	async.eachSeries(this.cases, function(testCase, next) {
		testCase[1](function(err) {
			if (err) return callback(['Error while doing "'+testCase[0]+'"', err, this.currentError, this.currentResponse]);

			next();
		}.bind(this));
	}.bind(this), function(err) {
		if (err) return callback([err, this.currentError, this.currentResponse]);

		callback();
	});
};

module.exports = unity;