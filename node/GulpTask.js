/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global require, exports, process */

var exec = require('child_process').exec;
var task = '';
var projectPath = '';

function start(tsk, prPth)
{
	task = tsk;
	projectPath = prPth;

	console.log("START TASK: " + task);
	console.log("START IN: " + projectPath);

	process.chdir(projectPath);

	var gulpTask = exec('gulp ' + task);

	gulpTask.stdout.on("data", onDataHandler);
	gulpTask.stdout.on("close", onCloseHandler);
	gulpTask.stdout.on("error", onErrorHandler);
}

function kill()
{
	// TODO: Kill process
}

function onDataHandler(data)
{
	var output = data.toString("utf-8").match(/[^\r\n]+/g);
	var startRegex = /\[gulp\]\sStarting\s\'([\w-]+)\'/;
	var finishRegex = /\[gulp\]\sFinished\s\'([\w-]+)\'/;

	for(var i = 0; i < output.length; i++)
	{
		var outputLine = output[i];
		console.log(i + ": ["+outputLine+"]");
		exports.onLog(outputLine);

		if(startRegex.test(outputLine))
		{
			exports.onStart(startRegex.exec(outputLine)[1]);
		}
		if(finishRegex.test(outputLine))
		{
			exports.onFinish(finishRegex.exec(outputLine)[1]);
		}
	}
}

function onCloseHandler()
{
	exports.onClose(task);
}

function onErrorHandler()
{
	exports.onError(task);
}

function onStart(task) { }

function onFinish(task) { }

function onClose(task) { }

function onError(task) { }

function onLog(message) { }

exports.start = start;
exports.kill = kill;

exports.onStart = onStart;
exports.onFinish = onFinish;
exports.onClose = onClose;
exports.onError = onError;
exports.onLog = onLog;
