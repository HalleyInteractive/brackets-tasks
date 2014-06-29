/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, define, brackets, Mustache */

define(function (require, exports, module)
{
	"use strict";

	/** BRACKETS MODULES **/
	var AppInit = brackets.getModule("utils/AppInit");
	var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
	var NodeDomain = brackets.getModule("utils/NodeDomain");
	var PanelManager = brackets.getModule("view/PanelManager");
	var ProjectManager = brackets.getModule("project/ProjectManager");

	/** VARIABLES **/
	var tasksDomain = null;
	var tasksPanel = null;
	var $tasksPanelContent = null;

	/** TEMPLATES **/
	var TEMPLATE_PANEL = require('text!templates/TasksPanel.template');
	var TEMPLATE_TASK_LIST = require('text!templates/TaskList.template');

	ExtensionUtils.loadStyleSheet(module, "css/brackets-tasks.css");
	AppInit.appReady(init);

	function init()
	{
		tasksDomain = new NodeDomain("tasks", ExtensionUtils.getModulePath(module, "node/Tasks"));
		$(tasksDomain).on("start", function(event, task){ console.log("START: " + task); });
		$(tasksDomain).on("finish", function(event, task){ console.log("FINISH: " + task); });
		$(tasksDomain).on("close", function(event, task){ console.log("CLOSE: " + task); });
		$(tasksDomain).on("error", function(event, task){ console.log("ERROR: " + task); });

		$(ProjectManager).on("projectOpen", function()
		{
			cleanUpTasks();
			initTasks();
			tasksDomain.exec('runTask');
		});

		$tasksPanelContent = $(Mustache.render(TEMPLATE_PANEL, {}));
		tasksPanel = PanelManager.createBottomPanel("brackets-tasks", $tasksPanelContent, 50);
		tasksPanel.show();

		initTasks();
	}

	function initTasks()
	{
		tasksDomain.exec("setProjectPath", ProjectManager.getProjectRoot().fullPath);
		tasksDomain.exec("getTaskList")
		.done(function(tasks)
		{
			var gulpTasks = '';
			if(tasks.gulp !== null)
			{
				gulpTasks = $(Mustache.render(TEMPLATE_TASK_LIST, tasks.gulp));
				console.group("GULP TASKS");
				console.log(tasks.gulp);
				console.groupEnd();
			}

			$("#task-list", $tasksPanelContent).append(gulpTasks);
		});
	}

	function taskOnStartHandler(event, task)
	{

	}

	function taskOnFinishHandler(event, task)
	{

	}

	function taskOnCloseHandler(event, task)
	{

	}

	function taskOnErrorHandler(event, task)
	{

	}

	function cleanUpTasks()
	{
		console.log("Clean up old tasks");
	}
});
