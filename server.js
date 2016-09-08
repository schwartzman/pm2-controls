var _ = require('lodash')
var async = require('async')
var express = require('express')
var pm2 = require('pm2')
var app = express()

function Directive(action, req){
	this.action = action
	this.module = req.params.module
}

function pm2Action(directive, res){
	async.waterfall([
		function(callback){
			pm2.connect(function(err){
				callback(err)
			})
		},
		function(callback){
			pm2[directive.action](directive.module, function(err, result){
				callback(err, result)
			})
		}
	], function(err, result){
		pm2.disconnect()
		if (err) { console.warn(err) }
		var output = err ? err : result[0].status
		res.send(_.upperFirst(directive.module) + ' ' + output)
	})
}

var loggy = function (req, res, next) {
	console.log('Request:', req.originalUrl)
	next()
}

app.use(loggy, express.static('public'))

app.get('/stop/:module', function(req, res){
	pm2Action(new Directive('stop', req), res)
})

app.get('/restart/:module', function(req, res){
	pm2Action(new Directive('restart', req), res)
})

app.listen(3000)
