/**
 * jQuery Hotspot : A jQuery Plugin to create hotspot for an HTML element
 *
 * Author: Aniruddha Nath
 * Version: 1.0.0
 * 
 * Website: https://github.com/Aniruddha22/jquery-hotspot
 * 
 * Description: A jquery plugin for creating and displaying Hotspots in an HTML element.
 *	It operates in two mode, admin and display. The design of the hotspot created are fully customizable.
 *	User can add their own CSS class to style the hotspots.
 * 
 * License: http://www.opensource.org/licenses/mit-license.php
 */

;(function($) {
	
	// Default settings for the plugin
	var defaults = {

		// Data
		data: [],

		// Hotspot Tag
		tag: 'img',

		// Mode of the plugin
		// Options: admin, display
		mode: 'display',

		// HTML5 LocalStorage variable
		LS_Variable: '__HotspotPlugin_LocalStorage',

		// Hidden class for hiding the data
		hiddenClass: 'hidden',

		// Event on which the data will show up
		// Options: click, hover, none
		interactivity: 'hover',

		// Buttons' id (Used only in Admin mode)
		done_btnId: 'HotspotPlugin_Done',
		remove_btnId: 'HotspotPlugin_Remove',
		sync_btnId: 'HotspotPlugin_Server',

		// Buttons class
		done_btnClass: 'btn btn-success HotspotPlugin_Done',
		remove_btnClass: 'btn btn-danger HotspotPlugin_Remove',
		sync_btnClass: 'btn btn-info HotspotPlugin_Server',

		// Classes for Hotspots
		hotspotClass: 'HotspotPlugin_Hotspot',
		hotspotAuxClass: 'HotspotPlugin_inc',

		// Overlay
		hotspotOverlayClass: 'HotspotPlugin_Overlay',

		// Enable ajax
		ajax: false,

		ajaxOptions: {
			url: ''
		},

		// No. of variables included in the spots
		dataStuff: [
			{
				'property': 'Title',
				'default': 'jQuery Hotspot'
			},
			{
				'property': 'Message',
				'default': 'This jQuery Plugin lets you create hotspot to any HTML element. '
			}
		]
	};
	
	//Constructor
	function Hotspot(element, options) {
		
		// Overwriting defaults with options
		this.config = $.extend(true, {}, defaults, options);
		
		this.element = element;
		this.imageEl = element.find(this.config.tag);
		this.imageParent = this.imageEl.parent();

		this.broadcast = '';

		var widget = this;

		// Event API for users
		$.each(this.config, function(index, val) {
			if (typeof val === 'function') {
				widget.element.on(index + '.hotspot', function() {
					val(widget.broadcast);
				});
			};
		});

		this.init();
	}

	Hotspot.prototype.init = function() {

		this.getData();

		if (this.config.mode != 'admin') {
			return;
		};

		var height = this.imageEl[0].height;
		var width = this.imageEl[0].width;

		// Masking the image
		$('<span/>', {
			html: '<p>This is Admin-mode. Click this Pane to Store Messages</p>'
		}).css({
			'height': height + 'px',
			'width': width + 'px'
		}).addClass(this.config.hotspotOverlayClass).appendTo(this.imageParent);

		var widget = this;
		var data = [];
		
		// Adding controls
		$('<button/>', {
			text: "Save Data"
		}).prop('id', this.config.done_btnId).addClass(this.config.done_btnClass).appendTo(this.imageParent);

		$('<button/>', {
			text: "Remove All"
		}).prop('id', this.config.remove_btnId).addClass(this.config.remove_btnClass).appendTo(this.imageParent);

		$(this.imageParent).delegate('button#' + this.config.done_btnId, 'click', function(event) {
			event.preventDefault();
			widget.storeData(data);
			data = [];
		});

		$(this.imageParent).delegate('button#' + this.config.remove_btnId, 'click', function(event) {
			event.preventDefault();
			widget.removeData();
		});

		if (this.config.ajax) {
			$('<button/>', {
				text: "To Server"
			}).prop('id', this.config.sync_btnId).addClass(this.config.sync_btnClass).appendTo(this.imageParent);

			$(this.imageParent).delegate('button#' + this.config.sync_btnId, 'click', function(event) {
				event.preventDefault();
				widget.syncToServer();
			});
		};

		// Start storing
		this.element.delegate('span', 'click', function(event) {
			event.preventDefault();
			
			var offset = $(this).offset();
			var relativeX = (event.pageX - offset.left);
			var relativeY = (event.pageY - offset.top);

			var dataStuff = widget.config.dataStuff;

			var dataBuild = {x: relativeX, y: relativeY};

			for (var i = 0; i < dataStuff.length; i++) {
				var val = dataStuff[i];
				var fill = prompt('Please enter ' + val.property, val.default);
				if (fill === null) {
					return;
				};
				dataBuild[val.property] = fill;
			};

			data.push(dataBuild);

			if (widget.config.interactivity === 'none') {
				var htmlBuilt = $('<div/>');
			} else {
				var htmlBuilt = $('<div/>').addClass(widget.config.hiddenClass);
			}
			

			$.each(dataBuild, function(index, val) {
				if (typeof val === "string") {
					$('<div/>', {
						html: val
					}).addClass('Hotspot_' + index).appendTo(htmlBuilt);
				};
			});

			var div = $('<div/>', {
				html: htmlBuilt
			}).css({
				'top': relativeY + 'px',
				'left': relativeX + 'px'
			}).addClass(widget.config.hotspotClass + ' ' + widget.config.hotspotAuxClass).appendTo(widget.element);

			if (widget.config.interactivity === 'click') {
				div.on(widget.config.interactivity, function(event) {
					$(this).children('div').toggleClass(widget.config.hiddenClass);
				});
				htmlBuilt.css('display', 'block');
			} else {
				htmlBuilt.removeClass(widget.config.hiddenClass);
			}

			if (widget.config.interactivity === 'none') {
				htmlBuilt.css('display', 'block');
			};

		});

		// TODO - Update and Delete individual nodes
	}

	Hotspot.prototype.getData = function() {
		var widget = this;
		
		if (localStorage.getItem(this.config.LS_Variable) === null && this.config.data.length == 0) {

			if (this.config.ajax) {
				// Making AJAX call to fetch Data
				var dataObject = { 
					data: {
						HotspotPlugin_mode: "Retrieve"
					}
				};
				var ajaxSettings = $.extend({}, this.config.ajaxOptions, dataObject);
				$.ajax(ajaxSettings)
				.done(function(data) {
					localStorage.setItem(widget.config.LS_Variable, data);
					var obj = JSON.parse(data);
					widget.beautifyData();
				})
				.fail(function() {
					return;
				});
			} else {
				return;
			}
			
		} 

		if (this.config.mode == 'admin' && localStorage.getItem(this.config.LS_Variable) === null) {
			return;
		} 
		
		this.beautifyData();
	}

	Hotspot.prototype.beautifyData = function() {
		var widget = this;

		if (this.config.mode != 'admin' && this.config.data.length != 0) {
			var obj = this.config.data;
		} else {
			var raw = localStorage.getItem(this.config.LS_Variable);
			var obj = JSON.parse(raw);
		}

		for (var i = obj.length - 1; i >= 0; i--) {
			var el = obj[i];

			if (this.config.interactivity === 'none') {
				var htmlBuilt = $('<div/>');
			} else {
				var htmlBuilt = $('<div/>').addClass(this.config.hiddenClass);
			}

			$.each(el, function(index, val) {
				if (typeof val === "string") {
					$('<div/>', {
						html: val
					}).addClass('Hotspot_' + index).appendTo(htmlBuilt);
				};
			});

			var div = $('<div/>', {
				html: htmlBuilt
			}).css({
				'top': el.y + 'px',
				'left': el.x + 'px'
			}).addClass(this.config.hotspotClass).appendTo(this.element);

			if (widget.config.interactivity === 'click') {
				div.on(widget.config.interactivity, function(event) {
					$(this).children('div').toggleClass(widget.config.hiddenClass);
				});
				htmlBuilt.css('display', 'block');
			} else {
				htmlBuilt.removeClass(this.config.hiddenClass);
			}

			if (this.config.interactivity === 'none') {
				htmlBuilt.css('display', 'block');
			}
		};
	};

	Hotspot.prototype.storeData = function(data) {

		if (data.length == 0) {
			return;
		};

		var raw = localStorage.getItem(this.config.LS_Variable);
		obj = [];
		
		if (raw) {
			var obj = JSON.parse(raw);
		};

		$.each(data, function(index) {
			var node = data[index];

			obj.push(node);
		});

		localStorage.setItem(this.config.LS_Variable, JSON.stringify(obj));

		this.broadcast = 'Saved to LocalStorage';
		this.element.trigger('afterSave.hotspot');
	};

	Hotspot.prototype.removeData = function() {
		if (localStorage.getItem(this.config.LS_Variable) === null) {
			return;
		};
		if (!confirm("Are you sure you wanna do everything?")) {
			return;
		};
		localStorage.removeItem(this.config.LS_Variable);
		this.broadcast = 'Removed successfully';
		this.element.trigger('afterRemove.hotspot');
	};

	Hotspot.prototype.syncToServer = function() {
		if (localStorage.getItem(this.config.LS_Variable) === null) {
			return;
		};
		
		if (this.config.ajax) {
			// AJAX call to sync to server
			var widget = this;
			var dataObject = { 
				data: {
					HotspotPlugin_data: localStorage.getItem(this.config.LS_Variable),
					HotspotPlugin_mode: "Store"
				}
			};
			var ajaxSettings = $.extend({}, this.config.ajaxOptions, dataObject);
			$.ajax(ajaxSettings)
			.done(function() {
				widget.broadcast = 'Sync was successful';
				widget.element.trigger('afterSyncToServer.hotspot');
			})
			.fail(function() {
				widget.broadcast = 'Error';
				widget.element.trigger('afterSyncToServer.hotspot');
			});
		} else {
			return;
		}
	};

	$.fn.hotspot = function (options) {
		new Hotspot(this, options);
		return this;
	}

}(jQuery));