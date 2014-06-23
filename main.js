/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, define, brackets */

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
	var taskButtons = null;

	ExtensionUtils.loadStyleSheet(module, "css/brackets-tasks.css");
	AppInit.appReady(init);

	function init()
	{
		tasksDomain = new NodeDomain("tasks", ExtensionUtils.getModulePath(module, "node/Tasks"));
		$(ProjectManager).on("projectOpen", function()
		{
			cleanUpTasks();
			initTasks();
			tasksDomain.exec('runTask');
		});
		initTasks();
	}

	function initTasks()
	{
		tasksDomain.exec("setProjectPath", ProjectManager.getProjectRoot().fullPath);
		tasksDomain.exec("getTaskList")
		.done(function(tasks)
		{
			console.log("TASK LIST");
			console.log(tasks);
		});
	}

	function cleanUpTasks()
	{
		console.log("Clean up old tasks");
	}
});
