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
	var TEMPLATE_TASK_LIST_GULP = require('text!templates/TaskListGulp.template');
	var TEMPLATE_TASK_LIST_GRUNT = require('text!templates/TaskListGrunt.template');

	ExtensionUtils.loadStyleSheet(module, "css/brackets-tasks.css");
	AppInit.appReady(init);

	/**
	* Initialise the application, set up node domain and listeners
	* @method init
	*/
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

	/**
	* Gets the tasklist from the current project and sets up the buttons in the panel
	* @method initTasks
	*/
	function initTasks()
	{
		tasksDomain.exec("setProjectPath", ProjectManager.getProjectRoot().fullPath);
		tasksDomain.exec("getTaskList")
		.done(function(tasks)
		{
			var gulpTasks = '';
			if(tasks.gulp !== null)
			{
				gulpTasks = $(Mustache.render(TEMPLATE_TASK_LIST_GULP, tasks.gulp));
			}

			var gruntTasks = '';
			if(tasks.grunt !== null)
			{
				gruntTasks = $(Mustache.render(TEMPLATE_TASK_LIST_GRUNT, tasks.grunt));
			}

			$("#task-list", $tasksPanelContent).append(gulpTasks);
			$("#task-list", $tasksPanelContent).append(gruntTasks);
			$(".gulp.task", $tasksPanelContent).click(gulpTaskButtonClickHandler);
			$(".grunt.task", $tasksPanelContent).click(gruntTaskButtonClickHandler);

		});
	}

	/**
	* Fires after user clicks a task button
	* Starts the task in node
	* @method taskButtonClickHandler
	*/
	function gulpTaskButtonClickHandler()
	{
		var task = $(this).data('task');
		tasksDomain.exec('runTask', task);
		$("#task-panel .task[data-task='"+task+"']")
		.addClass('task-open');
	}

	/**
	* Fires after user clicks a task button
	* Starts the task in node
	* @method taskButtonClickHandler
	*/
	function gruntTaskButtonClickHandler()
	{
		var task = $(this).data('task');
		console.log("RUN: " + task);
	}

	/**
	* Event handler for every console line the task outputs
	* @method taskOnLogHandler
	* @param event {Object} Node event
	* @param message {String} line that is outputed in the console
	*/
	function taskOnLogHandler(event, message)
	{
		var date = new Date();
		var hours = date.getHours().toString().length === 1 ? "0" + date.getHours().toString() : date.getHours().toString();
		var minutes = date.getMinutes().toString().length === 1 ? "0" + date.getMinutes().toString() : date.getMinutes().toString();
		var seconds = date.getSeconds().toString().length === 1 ? "0" + date.getSeconds().toString() : date.getSeconds().toString();
		$("#task-panel #task-log").prepend("["+hours+":"+minutes+":"+seconds+"] "+message + "<br />");
	}

	/**
	* Event handler for when a specific task starts
	* This can also be started by another task
	* @method taskOnStartHandler
	* @param event {Object} Node event
	* @param task {String} Name of the task that is starting
	*/
	function taskOnStartHandler(event, task)
	{
		$("#task-panel .task[data-task='"+task+"']")
		.addClass('task-start');
	}

	/**
	* Event handler for when a specific task is finished
	* @method taskOnFinishHandler
	* @param event {Object} Node event
	* @param task {String} Name of the task that is finished
	*/
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

	/**
	* Event handler for when a task has completed and the process exits
	* @method taskOnCloseHandler
	* @param event {Object} Node event
	* @param task {String} Name of the task that is completed
	*/
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

	/**
	* Event handler for when a task throws an error
	* @method taskOnErrorHandler
	* @param event {Object} Node event
	* @param task {String} Name of the task that has an error
	*/
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

	/**
	* Removes listeners from the current task buttons and then removes them from the panel
	* Is called when the user switches to another project
	* @method cleanUpTasks
	*/
	function cleanUpTasks()
	{
		$('.task', $tasksPanelContent).unbind('click').remove();
	}
});
