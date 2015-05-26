/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
	// Application Constructor
	initialize : function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents : function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	onDeviceReady : function() {
		$(document).ready(function() {
    		ready();
    	});
	},
	// Update DOM on a Received Event
	receivedEvent : function(id) {
		var parentElement = document.getElementById(id);
		var listeningElement = parentElement.querySelector('.listening');
		var receivedElement = parentElement.querySelector('.received');

		listeningElement.setAttribute('style', 'display:none;');
		receivedElement.setAttribute('style', 'display:block;');

		console.log('Received Event: ' + id);
	}
};

var myscroll = null;

function ready() {
	var size = $(window).width() / 18;
	$("html").css("font-size", size);
	myscroll = new IScroll("#file-list");
	
	window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory,
		function(entries) {
			openDir(entries);
		}, function() {
			alert("error");
		}
	);
	
	$(".icon-plus").bindtouch(function() {
		$("#createFolder").show();
	});
	
	$("#btn-cancel-cf").bindtouch(function() {
		$("#createFolder").hide();
	});
	$("#btn-cf").bindtouch(function() {
		dirEntry.getDirectory($("#edit-folder-name").val(), {
			create: true,
			exclusive: true
		}, function() {
			$("#createFolder").hide();
		}, function() {
			alert("已存在同名文件夹");
		});
	});
	
	$(".icon-trash").bindtouch(function() {
		$(".icon-check").each(function() {
			var entry = $(this).parents(".item").data("entry");
			
			function sucess() {
				openDir(currentDir);
				viewNormal();
			}
			
			function fail() {
				alert("fail to delete file");
			}
			
			if(entry.isFile) {
				entry.remove(sucess,fail);
			} else {
				entry.removeRecursively(sucess, fail);
			}
		});
	});
	
	$(".icon-move").bindtouch(function() {
		var entryList = [];
		$(".icon-check").each(function() {
			var entry = $(this).parents(".item").data("entry");
			entryList.push(entry);
		});
		viewTarget(entryList, "move");
	});
	$(".icon-docs").bindtouch(function() {
		var entryList = [];
		$(".icon-check").each(function() {
			var entry = $(this).parents(".item").data("entry");
			entryList.push(entry);
		});
		viewTarget(entryList, "copy");
	});
	
	$(".icon-cancel").bindtouch(function(){
		viewNormal();
	});
	
	
	$(".icon-ok").bindtouch(function() {
		var entryList = $("#file-confirm").data("list");
		if ($("#file-confirm").data("action")=="move") {
			moveFile();
			function moveFile() {
				if (entryList.length==0) {
					viewNormal();
					openDir(currentDir);
				} else {
					var entry = entryList.pop();
					entry.moveTo(currentDir, null, finish, finish);
					function finish() {
						moveFile();
					}
				}
			}
		}
		if ($("#file-confirm").data("action")=="copy") {
			copyFile();
			function copyFile() {
				if (entryList.length==0) {
					viewNormal();
					openDir(currentDir);
				} else {
					var entry = entryList.pop();
					entry.copyTo(currentDir, null, finish, finish);
					function finish() {
						copyFile();
					}
				}
			}
		}
	});
}

function viewTarget(entryList, action) {
	$(".content .opers:not(.down)").addClass("down");
	$("#file-confirm").removeClass("down");
	$("#file-confirm").data("list", entryList);
	$("#file-confirm").data("action", action);
	$(".check").hide();
}

function viewNormal() {
	$(".content .opers:not(.down)").addClass("down");
	$("#file-nocheck").removeClass("down");
	
	$(".check").show();
	$(".icon-check").removeClass("icon-check").addClass("icon-check-empty");
}

function viewSelection() {
	$(".content .opers:not(.down)").addClass("down");
	$("#file-check").removeClass("down");
}

var currentDir = null;

function openDir(dirEntry) {
	currentDir = dirEntry;
	$("#btn-cf").bindtouch(function() {
		dirEntry.getDirectory($("#edit-folder-name").val(), {
			create: true,
			exclusive: true
		}, function() {
			$("#createFolder").hide();
			openDir(dirEntry);
		}, function() {
			alert("已存在同名文件夹");
		});
	});
	
	$("#nav-path span").html(dirEntry.name);
	
	$(".upper").bindtouch(function() {
		dirEntry.getParent(function(pentry) {
			openDir(pentry);
		}, function() {
		});
	});
	
	 dirEntry.createReader().readEntries(function (entries) {
		 orderFileEntry(entries);
		 $("#file-list ul li.item").remove();
	     for ( var i = 0; i < entries.length; i++) {
	            var entry = entries[i];
	            var cloned = $("#file-list .template").clone();
	            cloned.attr("id", "entry-" + entry.name);
	            cloned.removeClass("template").addClass("item");
	            cloned.data("entry", entry);
	            if (entry.isFile) {
	               cloned.find(".icon").addClass("file");
	            } else{
	               cloned.find(".icon").addClass("folder");
	               cloned.bindtouch(function() {
	            	   openDir($(this).data("entry"));
	               });
	            }
	            
	            cloned.find(".check").bindtouch(function() {
	            	if ($(this).hasClass("icon-check-empty")) {
	            		$(this).removeClass("icon-check-empty");
	            		$(this).addClass("icon-check");
	            	} else {
	            		$(this).addClass("icon-check-empty");
	            		$(this).removeClass("icon-check");
	            	}
	            	if ($(".icon-check").length>0) {
	            		viewSelection();
	            	} else {
	            		viewNormal();
	            	}
	            }, true);
	            
	            
	            cloned.find(".name").html(entry.name);
	            $("#file-list ul").append(cloned);
	        }
	        myscroll.refresh();
	    }, function(error) {
	    	alert("open dirEntry error : " + error)
	    });
}

function orderFileEntry(entries) {
	entries.sort(function(a, b) {
		if (a.isDirectory && b.isFile) {
			return -1;
		} else if (b.isDirectory && a.isFile) {
			return 1;
		} else {
			if (a.name.toLowerCase() > b.name.toLowerCase()) {
				return 1;
			} else {
				return -1;
			}
		}
	});
}

$.fn.bindtouch = function(cb, nobubble) {
	attachEvent($(this), cb , nobubble);
};

function attachEvent(src, cb, nobubble) {
	$(src).unbind();
	var isTouchDevice = 'ontouchstart' in window || navigator.msMaxTouchPoints;
	if (isTouchDevice) {
		$(src).bind("touchstart", function(event) {
			$(this).data("touchon", true);
			$(this).addClass("pressed");
			if(nobubble) {
				event.stopPropagation();
			}
		});
		$(src).bind("touchend", function() {
			$(this).removeClass("pressed");
			if ($(this).data("touchon")) {
				cb.bind(this)();
			}
			$(this).data("touchon", false);
			if(nobubble) {
				event.stopPropagation();
			}
		});
		$(src).bind("touchmove", function() {
			$(this).data("touchon", false);
			$(this).removeClass("pressed");
			if(nobubble) {
				event.stopPropagation();
			}
		});
	} else {
		$(src).bind("mousedown", function() {
			$(this).addClass("pressed");
			$(this).data("touchon", true);
		});
		$(src).bind("mouseup", function() {
			$(this).removeClass("pressed");
			$(this).data("touchon", false);
			cb.bind(this)();
		});
	}

}

app.initialize();