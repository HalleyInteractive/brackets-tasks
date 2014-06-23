/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global require, module, process */

function GulpTask()
{

	this.scope = this;
	this.exec = require('child_process').exec;
	this.task = '';
	this.projectPath = '';

	this.start = function()
	{
		process.chdir(this.scope.projectPath);
		var gulpTask = this.scope.exec('gulp ' + this.scope.task);

		gulpTask.stdout.on("data", this.scope.onData);//.bind(this.scope);
		gulpTask.stdout.on("close", this.scope.onClose);//.bind(this);
		gulpTask.stdout.on("error", this.scope.onError);//.bind(this.scope);
	};

	this.kill = function()
	{
		// TODO: Kill process
	};

	this.onData = function()
	{

	};

	this.onStart = function()
	{

	};

	this.onFinish = function()
	{

	};

	this.onClose = function()
	{
		// Empty Close Handler
		console.log("On Close Handler");
		console.log(this.scope);
		console.log("JOE");
	};

	this.onError = function()
	{

	};

}

module.exports = GulpTask;
