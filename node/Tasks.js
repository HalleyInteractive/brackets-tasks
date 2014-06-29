/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global require, exports, $ */

var fs = require('fs');

//var GulpTask = require('./GulpTask');

var projectPath = "";
var gulpTaskList = null;
var gruntTaskList = null;

var runningTasks = [];
var domainManager = null;

/**
* getTaskList
* Searches for gulp and grunt tasks in the project folder
* @return taskList Object List of available grunt and gulp tasks
*/
function getTaskList()
{
	var gulpAvailable = fs.existsSync(projectPath + 'gulpfile.js');
	var gulpFile = gulpAvailable ? require(projectPath + 'gulpfile.js') : null;
	gulpTaskList = gulpFile !== null ? gulpFile.tasks : null;
	var gulpTaskListArray = [];
	for(var gulpTask in gulpTaskList)
	{
		if(gulpTaskList.hasOwnProperty(gulpTask))
		{
			gulpTaskListArray.push(gulpTaskList[gulpTask]);
		}
	}
	var taskList = {
		gulp: gulpTaskListArray,
		grunt: gruntTaskList
	};

	return taskList;
}

/**
* setProjectPath
* Used to the the path of the current project from the user
* This is the path from where tasks are found and executed
* @param path String Full path to the current project folder
*/
function setProjectPath(path)
{
	console.log("SET PATH TO: " + path);
	projectPath = path;
}

/**
* runTask
* Executes a task
* @param task String the task name
* @param type String gulp or grunt
*/
function runTask(task, type)
{
	var gulpTask = require('./GulpTask');

	runningTasks.push(gulpTask);

	gulpTask.task = task;
	gulpTask.projectPath = projectPath;
	gulpTask.onStart = onStart;
	gulpTask.onFinish = onFinish;
	gulpTask.onClose = onClose;
	gulpTask.onError = onError;
	gulpTask.start(task, projectPath);
}

function onStart(task)
{
	domainManager.emitEvent("tasks", "start", task);
}

function onFinish(task)
{
	domainManager.emitEvent("tasks", "finish", task);
}

function onClose(task)
{
	domainManager.emitEvent("tasks", "close", task);
}

function onError(task)
{
	domainManager.emitEvent("tasks", "error", task);
}

/**
* init
* Registers all commands and events
*/
function init(_domainManager)
{
	domainManager = _domainManager;
	if (!domainManager.hasDomain("tasks")) { domainManager.registerDomain("tasks", {major: 0, minor: 1}); }

	// Register available commands
	domainManager.registerCommand('tasks', 'setProjectPath', setProjectPath, false);
	domainManager.registerCommand('tasks', 'getTaskList', getTaskList, false);
	domainManager.registerCommand('tasks', 'runTask', runTask, false);

	// Register available events
	domainManager.registerEvent('tasks', 'start');
	domainManager.registerEvent('tasks', 'finish');
	domainManager.registerEvent('tasks', 'close');
	domainManager.registerEvent('tasks', 'error');
}

exports.init = init;
