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
		$(tasksDomain).on("log", taskOnLogHandler);
		$(tasksDomain).on("start", taskOnStartHandler);
		$(tasksDomain).on("finish", taskOnFinishHandler);
		$(tasksDomain).on("close", taskOnCloseHandler);
		$(tasksDomain).on("error", taskOnErrorHandler);

		$(ProjectManager).on("projectOpen", function()
		{
			cleanUpTasks();
			initTasks();
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
			}

			$("#task-list", $tasksPanelContent).append(gulpTasks);
			$(".task", $tasksPanelContent).click(taskButtonClickHandler);

		});
	}

	function taskButtonClickHandler()
	{
		var task = $(this).data('task');
		tasksDomain.exec('runTask', task);
		$("#task-panel .task[data-task='"+task+"']")
		.addClass('task-open');
	}

	function taskOnLogHandler(event, message)
	{
		$("#task-panel #task-log").prepend(message + "<br />");
	}

	function taskOnStartHandler(event, task)
	{
		$("#task-panel .task[data-task='"+task+"']")
		.addClass('task-start');
	}

	function taskOnFinishHandler(event, task)
	{
		$("#task-panel .task[data-task='"+task+"']")
		.addClass('task-finish')
		.delay(200)
		.queue(function(next)
		{
			$(this)
			.removeClass('task-start')
			.removeClass('task-finish');
			next();
		});
	}

	function taskOnCloseHandler(event, task)
	{
		$("#task-panel .task[data-task='"+task+"']")
		.addClass('task-close')
		.delay(200)
		.queue(function(next)
		{
			$(this)
			.removeClass('task-open')
			.removeClass('task-close');
			next();
		});
	}

	function taskOnErrorHandler(event, task)
	{
		$("#task-panel .task[data-task='"+task+"']")
		.removeClass('task-open')
		.removeClass('task-start')
		.removeClass('task-finish')
		.removeClass('task-close')
		.addClass('task-error')
		.delay(2000)
		.queue(function(next)
		{
			$(this)
			.removeClass('task-error');
			next();
		});
	}

	function cleanUpTasks()
	{
		console.log("Clean up old tasks");
		$('.task', $tasksPanelContent).unbind('click').remove();
	}
});
