/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global require, exports, process */

var fs = require('fs');
var exec = require('child_process').exec;

var gulpTask = null;

var gulpAvailable = false;
var gulp = null;
var projectRoot = "";

var _domainManager;

function getGulpTaskList()
{
	if(gulpAvailable)
	{
		console.log("Returning tasks for: " + projectRoot);
		return gulp.tasks;
	} else
	{
		console.log("No gulp file found in project directory");
	}
}

function runGulpTask(task)
{
	console.log("RUN TASK: " + task);

	process.chdir(projectRoot);
    gulpTask = exec('gulp ' + task);

	gulpTask.stdout.on("data", gulpTaskData);
	gulpTask.stdout.on("close", gulpTaskDone);
	gulpTask.stdout.on("error", taskError);

	return true;
}

function gulpTaskData(data)
{
	var output = data.toString("utf-8").match(/[^\r\n]+/g);
	var startRegex = /\[gulp\]\sStarting\s\'([\w-]+)\'/;
	var finishRegex = /\[gulp\]\sFinished\s\'([\w-]+)\'/;

	for(var i = 0; i < output.length; i++)
	{
		var outputLine = output[i];
		console.log(i + ": ["+outputLine+"]");
		if(startRegex.test(outputLine))
		{
			_domainManager.emitEvent(
				"tasks",	// Domain
				"start",	// Event
				startRegex.exec(outputLine)[1] // Task
			);
		}
		if(finishRegex.test(outputLine))
		{
			_domainManager.emitEvent(
				"tasks",	// Domain
				"finish",	// Event
				finishRegex.exec(outputLine)[1] // Task
			);
		}
	}
}

function gulpTaskDone(code)
{
	console.log("Task Done: " + code);
	_domainManager.emitEvent(
		"tasks",	// Domain
		"done",		// Event
		''			// Task
	);
}

function taskError(data)
{
	console.log("Task error: " + data.toString('utf-8'));
	_domainManager.emitEvent(
		"tasks",	// Domain
		"error",	// Event
		''			// Task
	);
}

function setProjectRoot(projectRootFolder)
{
	console.log("Setting project root folder to: " + projectRootFolder);
	projectRoot = projectRootFolder;
	gulpAvailable = fs.existsSync(projectRoot + 'gulpfile.js');
	gulp = gulpAvailable ? require(projectRoot + 'gulpfile.js') : null;
}

function init(domainManager)
{
	console.log("Gulp node init");
	_domainManager = domainManager;
	if (!domainManager.hasDomain("tasks")) { domainManager.registerDomain("tasks", {major: 0, minor: 1}); }

	domainManager.registerCommand
	(
		"tasks",				// domain name
		"getGulpTaskList",		// command name
		getGulpTaskList,		// command handler function
		false,					// this command is synchronous in Node
		"Returns a list of all found gulp tasks",
		[],
		[{name: "tasks", // return values
		type: "Object",
		description: "Lists of gulp tasks"}]
	);

	domainManager.registerCommand
	(
		"tasks",				// domain name
		"setProjectRoot",		// command name
		setProjectRoot,			// command handler function
		false,					// this command is synchronous in Node
		"This sets the project root variable",
		[{name:"path", type:"String", description:"Full path the the project root folder"}],
		[]
	);

	domainManager.registerCommand
	(
		"tasks",				// domain name
		"runGulpTask",			// command name
		runGulpTask,			// command handler function
		false,					// this command is synchronous in Node
		"Executes a gulp task",
		[{name:"task", type:"String", description:"Name of the task that should be fired"}],
		[]
	);

	domainManager.registerEvent
	(
		"tasks",
		"start",
		[
			{
				name: "task",
				type: "string",
				description: "Name of the task being started by Gulp"
			}
		]
	);

	domainManager.registerEvent
	(
		"tasks",
		"finish",
		[
			{
				name: "task",
				type: "string",
				description: "Name of the task that is finished by Gulp"
			}
		]
	);

	domainManager.registerEvent
	(
		"tasks",
		"done",
		[
			{
				name: "task",
				type: "string",
				description: "Name of the task that is completely done"
			}
		]
	);

	domainManager.registerEvent
	(
		"tasks",
		"error",
		[
			{
				name: "task",
				type: "string",
				description: "Name of the task that has an error"
			}
		]
	);
}

exports.init = init;
