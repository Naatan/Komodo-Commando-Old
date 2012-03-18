commando = new function()
{
	
	var $this = this;
	
	var $commands = null;
	var $tools 	  = {};
	
	var ko 				= parent.opener.ko;
	var mainDocument 	= parent.opener.document;
	var mainWindow 		= parent.opener.window;
	
	this.onLoad = function()
	{
		document.getElementById("commando-search").focus();
		this.loadCommands();
		window.addEventListener('keypress', $this.onKeyPressWindow, true);
	};
	
	this.onInput = function(e)
	{
		$this.loadCommands(e.value);
		
		var list = document.getElementById('commando-results');
		list.selectItem(list.getItemAtIndex(0));
	};
	
	this.onKeyPressWindow = function(e)
	{
		var list = document.getElementById('commando-results');
		
		switch (e.keyCode)
		{
			case 13:
				setTimeout(window.close, 50);
				$this.runSelected();
				e.preventDefault();
				e.stopPropagation();
				break;
			case 27:
				window.close();
				e.preventDefault();
				e.stopPropagation();
				break;
			case 38:
				list.selectItem(list.getItemAtIndex(list.selectedIndex - 1));
				list.ensureIndexIsVisible(list.selectedIndex);
				e.preventDefault();
				e.stopPropagation();
				break;
			case 40:
			case 9:
				list.selectItem(list.getItemAtIndex(list.selectedIndex + 1));
				list.ensureIndexIsVisible(list.selectedIndex);
				e.preventDefault();
				e.stopPropagation();
				break;
		}
	};
	
	this.onKeyPress = function(e)
	{

	};
	
	this.onSelect = function()
	{
		setTimeout(window.close, 50);
		$this.runSelected();
	};
	
	this.runSelected = function()
	{
		var list = document.getElementById('commando-results');
		var item = list.getItemAtIndex(list.selectedIndex);
		
		if ( ! item)
		{
			return false;
		}
		
		if (!isNaN(item.value))
		{
			if ($tools[item.value] === undefined)
			{
				return false;
			}
			
			ko.toolbox2.invokeTool($tools[item.value].koTool);
		}
		else
		{
			var commands = $this.getCommands();
			
			if (commands[item.value] === undefined)
			{
				return false;
			}
			
			ko.commands.doCommand(item.value)
		}
		
	};
	
	this.loadCommands = function(string)
	{
		var list = document.getElementById('commando-results');
		var cmds = $this.getCommands();
		
		$this.emptyList();
		
		var listItems = [];
		
		if (string === undefined)
		{
			string = "";
		}
		
		words  = string.split(" ");
		
		for (cmd in cmds)
		{
			if (string == "" || $this.hasWords(cmds[cmd],words))
			{
				listItems.push({value: cmd, label: cmds[cmd]});
			}
		}
		
		listItems.sort(function(a,b) {
			if (a.label.toLowerCase() < b.label.toLowerCase())
				return -1;
			if (a.label.toLowerCase() > b.label.toLowerCase())
				return 1;
			return 0;
		});
		
		for (var x=0;x<listItems.length;x++)
		{
			list.appendItem(listItems[x].label, listItems[x].value);
		}
	};
	
	this.hasWords = function(string,words)
	{
		string = string.toLowerCase();
		for (var i=0;i<words.length;i++)
		{
			if (string.indexOf(words[i].toLowerCase())==-1)
			{
				return false;
			}
		}
		
		return true;
	}
	
	this.emptyList = function()
	{
		var list = document.getElementById('commando-results');
		
		while (list.firstChild) {
			list.removeChild(list.firstChild);
		}
	};
	
	this.getCommands = function()
	{
		if ($commands != null)
		{
			return $commands;
		}
		
		$commands = {};
		var shortcuts = ko.keybindings.manager.activeCommands;
		var commands  = $this.getAvailableCommands();
		
		for (var cmd in commands)
		{
			if ($commands[cmd] !== undefined)
			{
				continue;
			}
			
			var shortcut = '';
			if (shortcuts[cmd] != undefined && shortcuts[cmd][0] != undefined)
			{
				shortcut = " \u2014 " + shortcuts[cmd][0];
			}
			
			$commands[cmd] = commands[cmd] + " (command"+shortcut+")"
		}
		
		var tbSvc = Components.classes["@activestate.com/koToolbox2Service;1"].getService(Components.interfaces.koIToolbox2Service);
		var hits  = tbSvc.findTools("", 0, [], {});
			
		$tools = {};
		for (var x=0;x<hits.length;x++)
		{
			var label = hits[x].name;
			
			if (hits[x].subDir)
			{
				label += " ("+hits[x].type+" \u2014 "+hits[x].subDir+")";
			}
			else
			{
				label += " ("+hits[x].type+")"
			}
			
			$tools[hits[x].path_id] = hits[x];
			$commands[hits[x].path_id] = label;
		}
		
		return $commands;
	};
	
	this.getAvailableCommands = function()
	{
		ko.keybindings.manager.parseGlobalData();
		
		var cmds = {};
		var avCmds = ko.keybindings.manager.commanditems;
		
		for (var x=0;x<avCmds.length;x++)
		{
			
			var desc = avCmds[x].desc;
			
			if (desc == "")
			{
				desc = avCmds[x].name;
				desc = desc.replace('cmd_','');
				desc = desc.replace(/([A-Z][a-z])/g,' $1');
				desc = desc.replace(/_/g,' ');
				desc = desc.replace(/(?:^|\s)([a-z])/g, function($1) { return $1.toUpperCase(); });
				desc = desc.trim();
			}
			
			cmds[avCmds[x].name] = desc;
		}
		
		return cmds;
	}
	
};