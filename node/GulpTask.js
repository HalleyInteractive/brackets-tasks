/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global require, exports, process, module */

function GulpTask()
{
	this.scope = this;
	this._projectRoot = '';
	this._task = '';
	this._domainManager = null;

	this.exec = require('child_process').exec;
	this.gulpTask = null;

	console.log("GULP TASK CREATED");

	this.start = function(projectRoot, task, domainManager)
	{
		this.scope._projectRoot = projectRoot;
		this.scope._task = task;
		this.scope._domainManager = domainManager;

		console.log("GULP TASK START");

		process.chdir(this.scope._projectRoot);
		this.scope.gulpTask = this.scope.exec('gulp ' + this.scope._task);

		this.scope.gulpTask.stdout.on("data", this.scope.gulpTaskData);
		//this.scope.gulpTask.stdout.on("close", this.scope.gulpTaskDone);
		//this.scope.gulpTask.stdout.on("error", this.scope.taskError);

		return true;
	};

	this.gulpTaskData = function(data)
	{
		var output = data.toString("utf-8").match(/[^\r\n]+/g);
		var startRegex = /\[gulp\]\sStarting\s\'([\w-]+)\'/;
		var finishRegex = /\[gulp\]\sFinished\s\'([\w-]+)\'/;

		console.log("DOMAINMANAGER:");
		console.log(domainManager);

		for(var i = 0; i < output.length; i++)
		{
			var outputLine = output[i];
			console.log(i + ": ["+outputLine+"]");

			if(startRegex.test(outputLine))
			{
				/*
				this.scope._domainManager.emitEvent(
					"tasks",			// Domain
					"start",			// Event
					this.scope._task	// task
				);
				*/
			}
			if(finishRegex.test(outputLine))
			{
				/*
				this.scope._domainManager.emitEvent(
					"tasks",			// Domain
					"finish",			// Event
					this.scope._task	// task
				);
				*/
			}

		}
	};

	this.gulpTaskDone = function(code)
	{
		console.log("Task Done: " + code);
		this.scope._domainManager.emitEvent(
			"tasks",				// Domain
			"done",					// Event
			this.scope._task		// _task
		);
	};

	this.taskError = function(data)
	{
		console.log("Task error: " + data.toString('utf-8'));
		this.scope._domainManager.emitEvent(
			"tasks",				// Domain
			"error",				// Event
			this.scope._task		// _task
		);
	};
}

module.exports = GulpTask;
