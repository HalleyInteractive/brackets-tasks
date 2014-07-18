/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global require, exports, process */

// Process
var exec = require('child_process').exec;

// Task that is running
var task = '';

// Path from where the task is started
var projectPath = '';

/**
* Starts a task from a specific folder
* @method start
* @param tst {String} Name of the task to be started
* @param prPth {String} Path from where the task should be executed
*/
function start(tsk, prPth)
{
	task = tsk;
	projectPath = prPth;

	console.log("START TASK: " + task);
	console.log("START IN: " + projectPath);

	process.chdir(projectPath);

	var gulpTask = exec('grunt ' + task);

	gulpTask.stdout.on("data", onDataHandler);
	gulpTask.stdout.on("close", onCloseHandler);
	gulpTask.stdout.on("error", onErrorHandler);
}

/**
* Kills the running process
*/
function kill()
{
	// TODO: Kill process
}

/**
* Event handler for the stdout of the process that runs the task
* @method onDataHandler
* @param data {Stream} Data from the process
*/
function onDataHandler(data)
{
	var output = data.toString("utf-8").match(/[^\r\n]+/g);
	var startRegex = /Running\s\"([\w:]+)\"\s\((\w+)\)\stask/i;
	var finishRegex = /Done\,\swithout\serrors\./i;
	var warningRegex = /Aborted\sdue\sto\swarnings\./i;
	var styleRegexs = [/\\u001b/, /\[\d+m/, /\[\d+m$/];

	for(var i = 0; i < output.length; i++)
	{
		var outputLine = output[i];

		for(var sr = 0; sr < styleRegexs.length; sr++)
		{
			outputLine = outputLine.replace(styleRegexs[sr], '');
		}

		console.log(i + ": ["+outputLine+"]");
		exports.onLog(outputLine);

		if(startRegex.test(outputLine))
		{
			console.log("START START START");
			exports.onStart(startRegex.exec(outputLine)[1]);
		}
		if(finishRegex.test(outputLine))
		{
			console.log("END END ENDS");
			exports.onFinish(finishRegex.exec(outputLine)[1]);
		}
	}
}

/**
* Executes the onClose function in the exports object, adds the task name that is closed
* @method onCloseHandler
*/
function onCloseHandler()
{
	exports.onClose(task);
}

/**
* Executes the onError function in the exports object, adds the task name that has an error
* @method onErrorHandler
*/
function onErrorHandler()
{
	exports.onError(task);
}

/**
* Dummy function for exports.onStart
* @method onStart
*/
function onStart(task) { }

/**
* Dummy function for exports.onFinish
* @method onFinish
*/
function onFinish(task) { }

/**
* Dummy function for exports.onClose
* @method onClose
*/
function onClose(task) { }

/**
* Dummy function for exports.onError
* @method onError
*/
function onError(task) { }

/**
* Dummy function for exports.onLog
* @method onLog
*/
function onLog(message) { }


// Export functions
exports.start = start;
exports.kill = kill;
exports.onStart = onStart;
exports.onFinish = onFinish;
exports.onClose = onClose;
exports.onError = onError;
exports.onLog = onLog;
