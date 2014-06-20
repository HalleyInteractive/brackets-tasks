/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, define, brackets */

define(function (require, exports, module)
{
    "use strict";

	var _require = require;
	var _exports = exports;
	var _module = module;

	var AppInit				= brackets.getModule("utils/AppInit");
	var ExtensionUtils		= brackets.getModule("utils/ExtensionUtils");
    var NodeDomain			= brackets.getModule("utils/NodeDomain");
	var PanelManager		= brackets.getModule("view/PanelManager");
	var projectManager		= null;
    var tasksDomain			= null;
	var gulpPanel			= null;
	var gulpPanelManager	= null;
	var gulpTaskButtons		= [];

	// Load stylesheet
	ExtensionUtils.loadStyleSheet(module, "brackets-tasks.css");

	AppInit.appReady(function ()
	{
		console.log("Gulp tasks app ready");
		projectManager = brackets.getModule('project/ProjectManager');
		tasksDomain = new NodeDomain("tasks", ExtensionUtils.getModulePath(_module, "node/Tasks"));

		tasksDomain.exec("setProjectRoot", projectManager.getProjectRoot().fullPath)
		.done(function()
		{
			getGulpTasks();
		})
		.fail(function(err)
		{
			console.error("Error setting project root folder", err);
		});
    });

	function getGulpTasks()
	{
		tasksDomain.exec("getGulpTaskList")
		.done(function(tasks)
		{
			console.log(tasks);
			gulpPanel = $("<div id='gulp-panel'></div>");
			for(var task in tasks)
			{
				var taskButton = $("<div class='task' data-task='"+task+"'>" + task + "</div>");
				taskButton.click(gulpTaskClickHandler);
				console.log(taskButton);
				gulpPanel.append(taskButton);
				gulpTaskButtons.push(taskButton);
			}
			console.log(gulpPanel);
			gulpPanelManager = PanelManager.createBottomPanel("Gulp tasks", gulpPanel, 23 /* height */);
			gulpPanelManager.show();
		})
		.fail(function(err)
		{
			console.error("Error loading gulp tasks", err);
		});
	}

	function gulpTaskClickHandler()
	{
		console.log("RUN: " + $(this).data('task'));
		tasksDomain.exec("runGulpTask", $(this).data('task'));
	}

});

