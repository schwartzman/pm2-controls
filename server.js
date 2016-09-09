var _ = require('lodash')
var async = require('async')
var express = require('express')
var pm2 = require('pm2')
var app = express()

function Directive(action, req){
	this.action = action
	this.module = req.params.module
}

function output(err, result, directive, res) {
	var msg
	if (err) {
		console.warn(err)
		msg = err
	} else {
		msg = (directive.action == 'describe') ? 'status: ' : 'action: '
		if(_.isEmpty(result)){
			msg += 'offline'
		} else {
			msg += result[0].pm2_env.status
		}
	}
	res.send(_.upperFirst(directive.module) + ' ' + msg)
}

function outputList(err, result, res) {
	var msg
	if (err) {
		console.warn(err)
		msg = err
	} else {
		msg = 'Status of all existing processes\n\n'
		for (var module of result) {
			msg += _.upperFirst(module.name) + ': ' + module.pm2_env.status + '\n'
		}
	}
	res.send(msg)
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
		output(err, result, directive, res)
	})
}

function pm2List(directive, res){
	async.waterfall([
		function(callback){
			pm2.connect(function(err){
				callback(err)
			})
		},
		function(callback){
			pm2.list(function(err, result){
				callback(err, result)
			})
		}
	], function(err, result){
		pm2.disconnect()
		outputList(err, result, res)
	})
}

var loggy = function (req, res, next) {
	console.log('Request:', req.originalUrl)
	next()
}

app.use(loggy, express.static('public'))

app.get('/list', function(req, res){
	pm2List('list', res)
})

app.get('/describe/:module', function(req, res){
	pm2Action(new Directive('describe', req), res)
})

app.get('/stop/:module', function(req, res){
	pm2Action(new Directive('stop', req), res)
})

app.get('/restart/:module', function(req, res){
	pm2Action(new Directive('restart', req), res)
})

app.listen(3000)
