var async = require('async')
var express = require('express')
var pm2 = require('pm2')
var app = express()

function pm2Action(action, res){
	async.waterfall([
		function(callback){
			pm2.connect(function(err){
				callback(err)
			})
		},
		function(callback){
			pm2[action]('thor', function(err, result){
				callback(err, result)
			})
		}
	], function(err, result){
		pm2.disconnect()
		if (err) { console.warn(err) }
		var output = err ? err : result[0].status
		res.send(output)
	})
}

var loggy = function (req, res, next) {
	console.log('Request:', req.originalUrl)
	next()
};

app.use(loggy, express.static('public'))

app.get('/stop', function(req, res){
	pm2Action('stop', res)
})

app.get('/restart', function(req, res){
	pm2Action('restart', res)
})

app.listen(3000)
