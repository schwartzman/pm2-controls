const _ = require('lodash')
const async = require('async')
const express = require('express')
const globalModules = require('global-modules')
const nunjucks = require('nunjucks')
const pm2 = require(globalModules+'/pm2')
const pm2SelfName = require('./pm2.json').name
const app = express()

function Directive(action, req){
	this.action = action
	this.module = req.params.module
}

function output(err, result, directive, res) {
	let msg
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
	let msg
	if (err) {
		console.warn(err)
		msg = err
	} else {
		msg = 'Status of all existing processes\n\n'
		for (var module of result) {
			msg += module.name + ': ' + module.pm2_env.status + '\n'
		}
	}
	res.send(msg)
}

function pm2Action(directive, res){
	async.waterfall([
		(callback) => {
			pm2.connect((err) => {
				callback(err)
			})
		},
		(callback) => {
			pm2[directive.action](directive.module, (err, result) => {
				callback(err, result)
			})
		}
	],
	(err, result) => {
		pm2.disconnect()
		output(err, result, directive, res)
	})
}

function pm2List(inject, callbackTop, res=null){
	async.waterfall([
		(callback) => {
			pm2.connect((err) => {
				callback(err)
			})
		},
		(callback) => {
			pm2.list((err, result) => {
				callback(err, result)
			})
		}
	],
	(err, result) => {
		pm2.disconnect()
		const args = inject ? [err, result, res] : [_.without(result.map(x => x.name), pm2SelfName)]
		callbackTop(...args)
	})
}

var loggy = function (req, res, next) {
	console.log('Request:', req.originalUrl)
	next()
}

app.use(loggy, express.static('public'))

nunjucks.configure('views', {
    autoescape: true,
    express: app
})

app.get('/', (req, res) => {
	pm2List(false, (procs) => {
		res.render('index.j2', {procs: procs})
	})
})

app.get('/list', (req, res) => {
	pm2List(true, outputList, res)
})

app.get('/describe/:module', (req, res) => {
	pm2Action(new Directive('describe', req), res)
})

app.get('/stop/:module', (req, res) => {
	pm2Action(new Directive('stop', req), res)
})

app.get('/restart/:module', (req, res) => {
	pm2Action(new Directive('restart', req), res)
})

app.listen(3000)
