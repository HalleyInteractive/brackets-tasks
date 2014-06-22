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
	var ProjectManager		= brackets.getModule("project/ProjectManager");
    var tasksDomain			= null;
	var gulpPanel			= $("<div id='gulp-panel'></div>");
	var gulpPanelManager	= null;
	var gulpTaskButtons		= [];

	// Load stylesheet
	ExtensionUtils.loadStyleSheet(module, "brackets-tasks.css");

	AppInit.appReady(initTasks);

	function initTasks()
	{
		console.log("Gulp tasks app ready");
		tasksDomain = new NodeDomain("tasks", ExtensionUtils.getModulePath(_module, "node/Tasks"));

		tasksDomain.exec("setProjectRoot", ProjectManager.getProjectRoot().fullPath)
		.done(function() { getGulpTasks(); })
		.fail(function(err) { console.error("Error setting project root folder", err); });

		$(tasksDomain).on("start", function(event, task)
		{
			$("#gulp-panel .task[data-task='"+task+"']")
			.addClass("active");
		});

		$(tasksDomain).on("finish", function(event, task)
		{
			$("#gulp-panel .task[data-task='"+task+"']")
			.delay(500)
			.queue(function(nxt) { $(this).removeClass("active").addClass("finished"); nxt(); })
			.delay(1000)
			.queue(function(nxt) { $(this).removeClass("finished"); nxt(); });
		});
	}

	function getGulpTasks()
	{
		tasksDomain.exec("getGulpTaskList")
		.done(function(tasks)
		{
			console.log(tasks);
			for(var task in tasks)
			{
				var taskButton = $("<div class='task' data-task='"+task+"'>" + task + "</div>");
				taskButton.click(gulpTaskClickHandler);
				gulpPanel.append(taskButton);
				gulpTaskButtons.push(taskButton);
			}

			if(gulpPanelManager === null)
			{
				console.log("CREATE TASKS PANEL");
				gulpPanelManager = PanelManager.createBottomPanel("Gulp tasks", gulpPanel, 23 /* height */);
			}

			gulpPanelManager.show();

		})
		.fail(function(err) { console.error("Error loading gulp tasks", err); });
	}

	function gulpTaskClickHandler()
	{
		tasksDomain.exec("runGulpTask", $(this).data('task'));
	}

	$(ProjectManager).on("projectOpen", function()
	{
		// gulpPanelManager.hide();
		for(var i = 0; i < gulpTaskButtons.length; i++)
		{
			gulpTaskButtons[i].unbind("click");
			gulpTaskButtons[i].remove();
		}
		initTasks();
	});

});

