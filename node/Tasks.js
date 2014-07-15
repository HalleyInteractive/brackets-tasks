/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global require, exports, $ */

// File system handle
var fs = require('fs');

// Path of the current user project folder
var projectPath = "";

// List of tasks from the gulpfile
var gulpTaskList = null;

// List of tasks from the gruntfile
var gruntTaskList = null;

// Curent running tasks
var runningTasks = [];

// Node domain manager
var domainManager = null;

/**
* getTaskList
* Searches for gulp and grunt tasks in the project folder
* @return taskList Object List of available grunt and gulp tasks
*/
function getTaskList()
{
	// GULP
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

	// GRUNT
	var gruntAvailable = fs.existsSync(projectPath + 'gruntfile.js');
	var gruntTaskListArray = [];
	if(gruntAvailable)
	{
		var gruntfile = require(projectPath + 'gruntfile.js');
		var gruntdummy = require('grunt');

		gruntdummy.file.setBase(projectPath);
		gruntdummy.registerTask = function (alias, taskname)
		{
			var task = { name: alias, type: 'alias', taskname: taskname };
			gruntTaskListArray.push(task);
		};

		gruntdummy.initConfig = function(config)
		{
			for(var task in config)
			{
				if(config.hasOwnProperty(task))
				{
					if(task !== 'pkg')
					{
						var maintask = { name: task, type: 'main', taskname: task };
						gruntTaskListArray.push(maintask);
						for(var subtask in config[task])
						{
							if(config[task].hasOwnProperty(subtask))
							{
								if(subtask !== 'options')
								{
									var mainsubtask = { name: subtask, type: 'sub', taskname: task };
									gruntTaskListArray.push(mainsubtask);
								}
							}
						}
					}
				}
			}
		};
		gruntfile(gruntdummy);
	}

	var taskList = {
		gulp: gulpTaskListArray,
		grunt: gruntTaskListArray
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
	gulpTask.onLog = onLog;
	gulpTask.onStart = onStart;
	gulpTask.onFinish = onFinish;
	gulpTask.onClose = onClose;
	gulpTask.onError = onError;
	gulpTask.start(task, projectPath);
}

/**
* Emits the log event in the task domain
* @method onLog
* @param message {String} Output line from the task process
*/
function onLog(message)
{
	domainManager.emitEvent("tasks", "log", message);
}

/**
* Emits the start event of a task
* @method onStart
* @param task {String} Name of the task
*/
function onStart(task)
{
	domainManager.emitEvent("tasks", "start", task);
}

/**
* Emits the finish event of a task
* @method onFinish
* @param task {String} Name of the task
*/
function onFinish(task)
{
	domainManager.emitEvent("tasks", "finish", task);
}

/**
* Emits the close event of a task
* @method onClose
* @param task {String} Name of the task
*/
function onClose(task)
{
	domainManager.emitEvent("tasks", "close", task);
}

/**
* Emits the error event of a task
* @method onError
* @param task {String} Name of the task
*/
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
	domainManager.registerEvent('tasks', 'log');
	domainManager.registerEvent('tasks', 'start');
	domainManager.registerEvent('tasks', 'finish');
	domainManager.registerEvent('tasks', 'close');
	domainManager.registerEvent('tasks', 'error');
}

// Export the init function
exports.init = init;
