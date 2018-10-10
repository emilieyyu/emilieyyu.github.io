var newCommentEmptyValue = "what do you think?";

var showFrameRate = false;

//ajax flags
var filesLoaded = false;
var referenceLoaded = false;


//sketchChanged keeps the flag to note if there was any change in the sketch attributes, the tab names, code, anything. If true, present Save/Fork buttons.
//codeChanged keeps the flag if there was any change in the code since the last played on this session. If true, clears console etc. on the next play.
var sketchChanged = false;
var codeChanged = sketchChanged;
var sketchPlaying = true;
var sketchWindow;
var processor = false;
var codeOptionsEnabled = false;
var adsEnabled = false;
var tabMode;
var owner = sketch.userID == sessionUser.userID;;
var consoleMode = window.owner ? 'auto' : 'minimized'; //minimized if guest, auto if owner or if sketch changed
var forksLoaded = false;

var demo = function () {
	//include functions here on launch, for demo purposes only.
	//clear up in production
	console.log('===DEMO MODE===');

	// $('.icon_code').click();
	toggleCodeOptions();
	//$('.icon_fork').click();
	//$('#codeVersionsLink').click();
	//$('.icon_share').click();
	//$('#saveSketchButton').click();
	//wannaLeaveReset();
	//$('#editSketchButton').click();
	//wannaSave(true);

}




$(function () {
	createTempVersion(); //create a temp version to keep new changes
	selectVersion(); //select the latest version of the code
	setupControls();
	$('.hideOnSketch').css('opacity', 1);

	if (!embedPage) {
		setupKeys();
	}
	setupCode();
	setupCodeOptions();
	setupDefaultLibraries();
	setupCustomLibraries();
	setupVersions();
	setupAddToClass();
	setupAddToCuration();
	setupFollow();


	setupEngineVersions();

	tippy('.codeOptions .tippy', {
		placement: 'top',
		animation: 'fade',
		trigger: 'mouseenter',
		// trigger: 'click',
		arrow: true,
		size: 'medium',
		interactive: false,
		maxWidth: '270px',
	});



	if (sketch.newSketch) {
		setupNewSketch();

		sketchEngine.runSketch(null, true); //to change button to play

		window.setTimeout(function () {
			toggleCodeOptions();
		}, 500);
		window.setTimeout(function () {
			sketchEngine.pauseSketch(true); //to change button to play 2
		}, 500);



	} else { //load existing sketch
		setupExistingSketch();
		//OP.animateTextIn('#introPanel h1', 800, 1200, 0, 2000);
		//OP.animateTextIn('#introPanel h1', 800, 1200, 0);

		$('body').addClass('playMode');

		setupIntroPanel();
		setupInfoPanel();




		$('.forceHide').removeClass('forceHide');


		var hash = window.location.hash;
		if (hash) {
			switch (hash) {
				case '#code':
					$('.icon_code').click();
					break;
				case '#play':
					$('.icon_play').click();
					break;
				case '#info':
					$('.icon_info').click();
					break;
			}
		} else {
			if (sketch.view == 'code') {
				$('.icon_code').click();
			}else{
				sketchEngine.runSketch(null, true);
			}
		}




	}

	if (+sketch.mode > 0) {
		sketchConsole.init(consoleMode);
		$('#archiveInfo').remove();
	} else {
		$('#archiveInfo .bg')
			.css('background-image', 'url("/sketch/' + sketch.visualID + '/thumbnail")')
		$('#archiveInfo').show();

	}


	$('body').removeClass('loading');

	//keep session alive 15 mins
	var interval = 15 * 60 * 1000; //in ms
	//var interval = 5000; //in ms
	var keepSessionAliveInterval = window.setInterval(function () {
		$.getJSON("/user/keepSessionAlive")
			.fail(function (response) {
				//stop further tries if user sessioned out.
				clog(response);
				if (response.responseJSON.success == false) {
					clearInterval(keepSessionAliveInterval);
				}
			});
	}, interval);

	$('[data-toggle="tooltip"]').tooltip({
		'html': true
	});

	$('#iosKeyboardPin').click(function () {
		let keyboard = $($('iframe').get()[0].contentWindow.document).find('#iosKeyboardInput')
		keyboard.focus();
		//keyboard.prompt();
	});

	if (!isProd()) {
		demo();
	}


})

var setupIntroPanel = function () {
	if (sketch.instructions && sketch.instructions.trim().length > 0) {
		$('#introPanel').addClass('active');
		window.setTimeout(function () {
			$('#introPanel').removeClass('active');
			window.setTimeout(function () {
				$('#introPanel').remove();
			}, 5000);
		}, 5000);
	} else {
		$('#introPanel').remove();
	}
}

var setupEngineVersions = function () {

	//find engine version from the library list, and sort by most recent
	var engineVersions = libraries.filter(function (l) {
		if (sketch.isPjs == 2) {
			return l.title == 'p5js';
		} else if (sketch.isPjs == 1) {
			return l.title == 'pjs';
		}
	});
	setupPassiveDropdown('#libraryIDDropdown',
		engineVersions,
		function (e) {
			return e.libraryID
		},
		function (d) {
			return d.libraryID == sketch.engineID
		},
		function (d, i) {
			return 'v' + d.version;
		},
		function (d) {
			if (sketch.engineID != d.libraryID) {
				sketch.engineID = d.libraryID;
				sketch.engineUrl = d.url;
				$('#editSketchPanel input[name="engineID"]').val(sketch.engineID);
				wannaSave(true);
			}
		});


}

//creates a selectable dropdown with low footprint. Used for versions.
var setupPassiveDropdown = function (container, data, keyFunction, isSelectedFunction, textFunction, onSelectCallback) {
	var container = d3.select(container);

	//make sure you select the version in the dropdown that is enabled.
	data.forEach(function (d) {
		d.enabled = d.selected = isSelectedFunction(d);
	});

	let vers = container
		.classed('passiveDropdown', true)
		.selectAll('li')
		.data(data, keyFunction);
	vers
		.enter()
		.append('li')
		.attr('value', keyFunction)
		.classed('selected', isSelectedFunction)
		.text(textFunction)
		.on('click', function (d) {
			//toggle the dropdown
			$(container.node()).toggleClass('active');

			//unselect all but the clicked dropdown, and make it enabled if any other was
			let anyEnabled = false;
			container.selectAll('li')
				.each(function (d) {
					d.selected = false;
					anyEnabled |= d.enabled;
					d.enabled = false;
				})
				.classed('selected', false);

			d.selected = true;
			d.enabled = anyEnabled;
			d3.select(this).classed('selected', true);

			//run the callback
			onSelectCallback(d);
		})
		.sort(function (a, b) {
			return compareVersions(b.version, a.version) //version decimal sensitive sorting
		});

	vers.exit().remove();

	//check if none is selected (eg. upon changing pjs/p5js mode, or none is enabled), then select the first option.
	if (container.selectAll('li.selected')[0].length == 0) {
		$(container.node()).find('li:first-of-type').click();
		$(container.node()).toggleClass('active'); //turn off the dropdown (which will open because of above).
	}
}


var setupDefaultLibraries = function () {
	//defaultLibraries includes all default libraries for p5js or pjs
	//ones that are enabled will have 'enabled' attribute set to true
	//the version will have 'selected' attribute set to true
	let defaultLibraries = libraries.filter(function (l) {
		return !l.custom && l.for == sketch.isPjs
	});

	d3.select('#libraryHeader').classed('hide', defaultLibraries.length == 0)

	//group libraries by title (because multiple versions)
	defaultLibraries = d3.nest()
		.key(function (l) {
			return l.title
		})
		.entries(defaultLibraries);

	//enable the library if any of the versions are in imports
	defaultLibraries.forEach(function (l) {
		l.enabled = false;
		l.description = l.values[0].description;
		l.docUrl = l.values[0].docUrl;

		l.description = l.description.replace('{{sketch.visualID}}', sketch.visualID); //socketIO description support;

		for (let i in l.values) {
			l.values[i].selected = sketch.imports.split(',').indexOf(l.values[i].libraryID) > -1;
			l.enabled |= l.values[i].selected;
		}
	});

	var libs = d3.select('#defaultLibraries').selectAll('li.default').data(defaultLibraries, ff('key'))
	var lisEnter = libs.enter()
		.append('li')
		.classed('library', true)
		.classed('default', true)
		.classed('checked', ff('enabled'))
	// .classed('col-xs-12', true);
	var label = lisEnter.append('div')
		.classed('settingLabel', true)
	label.append('a')
		.attr('target', '_blank')
		.attr('href', ff('docUrl'))
		.text(ff('key'))
	label.append('ul') //add version dropdown
		.classed('settingVersions', true)
		.each(function (d) {
			//setup version dropdowns for library versions
			setupPassiveDropdown(this,
				d.values,
				function (l) { //keyFunction
					return l.libraryID
				},
				function (l) { //Selected if:
					return sketch.imports.split(',').indexOf(l.libraryID) > -1
				},
				function (l, i) { //text content
					return 'v' + l.version;
				},
				function (l) { //on select:
					//updateSketchImports();
				});

		});

	var options = lisEnter.append('div')
		.classed('settingOptions', true)
		.classed('pull-right', true)

	//'enabled' radio
	options.append('input')
		.attr('type', "checkbox")
		.attr('name', function (d) {
			return "library-" + d.key
		})
		.attr('id', function (d) {
			return "library-" + d.key + "-true"
		})
		.attr('autocomplete', "off")

	options.append('label')
		.attr('for', function (d) {
			return "library-" + d.key + "-true"
		})
		//        .classed('icon', true)
		.each(appendToggleSVG);

	//check the correct radios per libraries selected
	options.selectAll('input[type="checkbox"]')
		.property('checked', ff('enabled'))
		.on('change', function (d) {
			d.enabled = d3.select(this).property('checked'); //add enabled to parent
			clog(d);
			d.values.forEach(function (v) { //add enabled to version as well
				v.enabled = v.selected ? d.enabled : false;
			})
			var li = $(this).closest('.library')
			li.toggleClass('checked');
			wannaSave(true);
		});
	lisEnter.append('div')
		.classed('settingDescription', true)
		.html(ff('description'));


	libs.exit()
		.transition()
		.duration(200)
		.style('opacity', 0)
		.remove();

	d3.selectAll('#defaultLibraries li').classed('checked', ff('enabled'));



	setupCodeSnippets(); //to convert code snippets on library descriptions.

}

var setupAds = function () {
	if (sessionUser.membershipType > 0 || user.membershipType > 0) {
		//don't show ads
		//$('#adContainer').hide();
		//nah, show Join Plus+ ad at least. #sustainableWebsite!
	} else {
		if (!adsEnabled) {
			$('#carbonAdContainer').html('<hr/><script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CKYIP5QL&placement=openprocessingorg" id="_carbonads_js"></script>');
		}
	}

}
var setupCustomLibraries = function () {
	libraries = _.uniq(libraries, false, _.iteratee('url'));

	//setup the link
	d3.select('#addCustomLibraryLink').on('click.addLibrary', function () {
		libraries.push({
			'libraryID': -Math.random(),
			'visualID': sketch.visualID,
			'url': '',
			'custom': true
		});
		setupCustomLibraries();
		$('#customLibraries li.custom:last-of-type input').focus();
		return false;

	})

	//myCustomLibraries includes all custom libraries for that sketch
	//all should be enabled by default
	let myCustomLibraries = libraries.filter(function (l) {
		return l.custom
	});


	//enable the library
	myCustomLibraries.forEach(function (l) {
		l.enabled = true;
	});

	//add to the library list
	var libs = d3.select('#customLibraries').selectAll('li.custom').data(myCustomLibraries, ff('url'))
	var lisEnter = libs.enter()
		.append('li')
		.classed('library', true)
		.classed('custom', true)
		.classed('checked', ff('enabled'))
		.classed('col-xs-12', true);
	var label = lisEnter.append('input')
		.classed('settingLabel', true)
		.attr('disabled', function (d) {
			return sessionUser.membershipType > 0 ? null : 'disabled'
		})
		.attr('type', 'url')
		.attr('pattern', "https://.+")
		.attr('placeholder', "Paste URL or file name")
		.on('focus', function (d) {
			$(this).val(d.url)
		})
		.on('blur', function (d) {
			d.url = $(this).val().trim();
			if (d.url.length == 0) { //remove if empty
				libraries = _.without(libraries, d);
			} else {
				wannaSave(true);
			}
			setupCustomLibraries();

		})
		.on('keyup', function (d) { //catch enter key
			if (d3.event.keyCode == 13) {
				d.url = $(this).val().trim();
				$(this).trigger('blur');
				if (d.url.length == 0) { //remove if empty
					libraries = _.without(libraries, d);
				} else {
					wannaSave(true);
				}
				setupCustomLibraries();
			}
		});

	var options = lisEnter.append('div')
		.classed('settingOptions', true)
		.classed('pull-right', true)

	//'enabled' radio
	options.append('input')
		.attr('type', "checkbox")
		.attr('name', function (d) {
			return "library-" + d.libraryID
		})
		.attr('id', function (d) {
			return "library-" + d.libraryID + "-true"
		})
		.attr('autocomplete', "off")

	options.append('label')
		.attr('for', function (d) {
			return "library-" + d.libraryID + "-true"
		})
		//        .classed('icon', true)
		.each(appendToggleSVG);

	//check the correct radios per libraries selected
	options.selectAll('input[type="checkbox"]')
		.property('checked', ff('enabled'))
		.on('change', function (d) {
			d.enabled = d3.select(this).property('checked');
			var li = $(this).closest('.library')
			li.toggleClass('checked');
			wannaSave(true);
		});

	libs.exit()
		.transition()
		.duration(200)
		.style('opacity', 0)
		.remove();

	//update
	d3.selectAll('#customLibraries li.custom')
		.classed('checked', ff('enabled'))
		.selectAll('.settingLabel')
		.each(function (d) {
			$(this).val(
				d.url.substr(d.url.lastIndexOf('/') + 1)
			);
		});

	//sort
	//d3.select('#customLibraries').selectAll('li.library').sort(function(a,b){ return a.custom && !b.custom ? 1: +a.libraryID > +b.libraryID ? 1 : -1});
}

//find the related versions from the enabled libraries and update imports of the sketch
//this is only needed when sketch is being saved to backend. Not needed when playing, as
// the enabled libraries are used when playing, not imports.
var getSketchImports = function () {
	//make sure to sort to prevent 4,3 != 3,4
	let prevImports = sketch.imports.split(',').sort(function (a, b) {
		return a > b ? 1 : -1
	}).join(',');
	sketch.imports = libraries
		.filter(ff('enabled'))
		.filter(ff('custom', false))
		.filter(function (d) {
			return d.title != 'p5js' && d.title != 'pjs'
		})
		.map(ff('libraryID'))
		.sort(function (a, b) {
			return a > b ? 1 : -1
		})
		.join(',');
	return sketch.imports;
	//clog('sketch imports', sketch.imports);
}

var setupTakeScreenshot = function () {
	$('#takeScreenshotIcon').on('click', setupScreenshotMode);

}
var setupScreenshotMode = function () {

	let endScreenshot = function (e) {
		//e.preventDefault();
		takeScreenshot();
		//unset 'r' key
		$('body').removeClass('recordMode');
		setupEditSketchPanel();
		Mousetrap.unbind('r');
		return true;
	}
	$('body').addClass('recordMode');
	$('#gifActions').hide();
	$('#screenshotActions').show();
	$('#takeScreenshotButton').off('click').on('click', endScreenshot);


	$('#mainControls .icon_play').click();

	//set 'r' key
	Mousetrap(window).bind('r', endScreenshot);
	Mousetrap($('#sketch iframe').get(0).contentWindow).bind('r', endScreenshot);
	return false;

}
var setupGIF = function () {
	$('#recordGifLink').on('click', setupRecordMode);

}
var setupRecordMode = function () {

	$('body').addClass('recordMode');
	$('#gifActions').show();
	$('#screenshotActions').hide();
	$('#recordButton').off('click').on('click', toggleGIF);
	$('#mainControls .icon_play').click();

	//set 'r' key
	Mousetrap(window).bind('r', function (e) {
		//e.preventDefault();
		toggleGIF();
		return true;
	});
	Mousetrap($('#sketch iframe').get(0).contentWindow).bind('r', function (e) {
		//e.preventDefault();
		toggleGIF();
		return true;
	});
	Mousetrap(window).bind('escape', function (e) {
		e.preventDefault();
		stopRecordingGIF();
		return false;
	});

	//let w = 400; //max width. Height will be scaled per w.
	//let h = w/$(processor.canvas).width()*$(processor.canvas).height();
	//gifjs doesn't scale, it just crops, so stick to standard for now.
	// let w = $(window.processor.canvas).width();
	// let h = $(window.processor.canvas).height();

	window.gif = new GIF({
		workers: 4,
		quality: 5,
		repeat: 0,
		debug: false,
		workerScript: '/assets/js/vendor/gif.js-master/dist/gif.worker.js'
	});
	window.gif.recording = false;


	return false;

}

var toggleGIF = function () {
	if (window.gif) {
		if (!window.gif.recording) {
			recordGIF();
		} else {
			stopRecordingGIF();
		}
	}
}
var recordGIF = function () {
	window.gif.recording = true;
	$('#recordButton').addClass('icon_recording pulsateInfinite');
	$('#recordContainer').addClass('recording');
	$('#animatedGIFLink').addClass('hide');
	let progressBar = $('<div id="recordGIFProgressBar"></div>');
	$('#sketch').append(progressBar);

	window.processor.canvas = $($('#sketch iframe').get(0).contentWindow.document).find('canvas').get(0);

	//re-set width and height
	let w = $(window.processor.canvas).width();
	let h = $(window.processor.canvas).height();

	window.gif.options.width = w;
	window.gif.options.height = h;


	let duration = 10000; //in ms
	let fps = 15;

	progressBar
		.css('transition', 'width ' + duration + 'ms linear')
	//.css('width','100%');

	//set frame creation timer
	let framer = window.setInterval(function () {
		if (window.gif.recording) {
			window.gif.addFrame(window.processor.canvas, {
				delay: 1000 / fps,
				copy: true
			});
		}
	}, 1000 / fps);

	window.setTimeout(function () { //auto-stop after duration
		if (window.gif.recording) {
			clearInterval(framer);
			stopRecordingGIF();
		}


	}, duration);

	//unset 'r' key
	Mousetrap.unbind('r');

	progressBar.css('width', '100%');


}
var stopRecordingGIF = function () {
	window.gif.recording = false;

	$('body').removeClass('recordMode');
	$('#recordButton').removeClass('icon_recording pulsateInfinite');
	$('#recordContainer').removeClass('recording');

	$('#recordGIFProgressBar').remove();
	$('#recordGifLink').button('loading');
	$('#GIFProgress').show();

	ga('send', {
		hitType: 'event',
		eventCategory: 'sketch',
		eventAction: 'createGIF'
	});
	window.gif.on('progress', function (p) {
		return $('#GIFProgress').css('width', Math.round(p * 100) + "%");
	});
	window.gif.on('finished', function (blob) {
		//allow download 
		let src = URL.createObjectURL(blob);
		//setupEditSketchPanel();
		updateGIF(src);
		$('#recordGifLink').button('reset');
		$('#GIFProgress').hide();
		if (sketch.userID == sessionUser.userID) { //upload to server
			saveGIF(blob);
		}

	});
	window.gif.render();

}
var saveGIF = function (blob) {
	var reader = new FileReader();
	// this function is triggered once a call to readAsDataURL returns
	reader.onload = function (event) {
		var fd = new FormData();
		fd.append('sketchGIF', event.target.result);
		$.ajax({
			type: 'POST',
			url: '/sketch/' + sketch.visualID + '/saveGIF_ajax',
			data: fd,
			processData: false,
			contentType: false
		}).done(function (data) {
			// print the output from the upload.php script
			//console.log(data);
		});
	};
	// trigger the read from the reader...
	reader.readAsDataURL(blob);


}
var updateGIF = function (imgURL) {
	$('#animatedGIF')
		.css('background-size', 'contain')
		.css('background-image', 'url(' + imgURL + ')')
		.off('click').on('click', function () {
			window.open(imgURL);
		})
	$('#animatedGIFLink').attr('href', imgURL).removeClass('hide');
	$('#GIFPreview').show();
}
var updateScreenshot = function (imgURI) {
	$('#screenshot').css('background-image', 'url(' + imgURI + ')');
	$('#editSketchPanel input[name="sketchThumb"]').val(imgURI);
}

var setupKeys = function () {
	Mousetrap.prototype.stopCallback = function (e, element, combo) {
		//clog(element);
		//clog($(element).closest('.CodeMirror').length == 1);
		// if the element has the class "mousetrap" then no need to stop
		if ($(element).hasClass('mousetrap') || $(element).closest('.CodeMirror').length == 1) {
			return false;
		}

		// stop for input, select, and textarea
		return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || (element.contentEditable && element.contentEditable == 'true');
	}
	//autoformat
	Mousetrap.bind('ctrl+b', function (e) {
		e.preventDefault();
		formatCode();
		return false;
	});

	//fullscreen
	Mousetrap.bind('ctrl+alt+f', function (e) {
		e.preventDefault();
		toggleFullscreen();
		return false;
	});
	//exit fullscreen
	Mousetrap.bind('escape', function (e) {
		if (isFullscreen()) {
			e.preventDefault();
			toggleFullscreen();
		}
	});
	//exit fullscreen
	Mousetrap.bind('command+s', function (e) {
		e.preventDefault();
		saveCodeState();
		$('html.newSketch #saveSketchButton, html.existingSketch #quickSaveButton').click();
		return false;
	});
	/*
	//info
	Mousetrap.bind('ctrl+z', function(e) {
		e.preventDefault();
		$('#mainControls .icon_info').click();
		return false;
	});
	//play
	Mousetrap.bind('ctrl+x', function(e) {
		e.preventDefault();
		$('#mainControls .icon_play').click();
		return false;
	});
	//code
	Mousetrap.bind('ctrl+c', function(e) {
		e.preventDefault();
		$('#mainControls .icon_code').click();
		return false;
	});
	*/




}

var appendToggleSVG = function (d, i) {
	let svgHTML = '<svg width="46px" height="21px" viewBox="0 0 46 21"> <g class="toggle-toggle" stroke="none" stroke-width="1" fill="none"><circle class="toggle-circle" cx="10.5" cy="10.5" r="10" stroke="#9B9B9B" stroke-width="1" fill="#73C2E9"></circle><polyline class="toggle-checkmark" stroke="#9B9B9B" transform="translate(10.445442, 9.307042) rotate(-320.000000) translate(-10.445442, -9.307042) " points="8.32544172 13.4824213 12.5654415 13.4824213 12.5654415 5.13166233"></polyline><path d="M35,11 L41,11 L41,10 L35,10 L35,4 L34,4 L34,10 L28,10 L28,11 L34,11 L34,17 L35,17 L35,11 Z" class="toggle-X" fill="#9B9B9B" transform="translate(34.500000, 10.500000) rotate(45.000000) translate(-34.500000, -10.500000) "></path>    </g>        </svg>';
	d3.select(this).html(svgHTML);

}
var setupNewSketch = function () {
	//remove info panel
	$('#infoPanel, #mainControls .icon_info, #introPanel, #sideControls').remove();
	$('.forceHide').removeClass('forceHide');

	$('input[name="saveAsNew"]').val('true');
	//activate code panel
	$('.icon_restart').removeClass('icon_restart');
	$('#mainControls .icon_code').click();


	//setup buttons
	$('#forkSketchButton, #quickSaveButton, .navbar .icon_fork').remove();
	$('#submitSketchButton').on('click', function () {
		submitSketch();
	});

	$('#saveSketchButton').on('click', function () {
		let $this = $(this);
		if (sessionUser.userID == 0) {
			OP.showJoinModal(function () {
				setupEditSketchPanel();
				activatePanel($this);
			}, "Join to save your sketch");
		} else {
			setupEditSketchPanel();
			activatePanel($this);
		}
	})

	setupGIF();
	setupTakeScreenshot();

	wannaSave(true);
	window.setTimeout(function () {
		getActiveEditor().focus();
	}, 2000); //leave time until visible
}

var setupExistingSketch = function () {
	if (!embedPage) {
		setupComments();
		//scroll comments to below
		$('.comments').scrollTop($('.comments').get()[0].scrollHeight);

		setupAddComment();
		setupGIF();
		setupTakeScreenshot();
		setupEmbed();
		setupHearts();
		setupShare();




		$('#submitSketchButton').on('click', function () {
			submitSketch();
		});
		$('#saveSketchButton').remove();

		//quicksave button is removed if guest via css
		$('#quickSaveButton').on('click', function () {
			$('input[name="parentID"]').val(sketch.parentID);
			$('input[name="saveAsNew"]').val('false');
			quickSave();
		})
		$('#forkSketchButton').on('click', function () {
			let $this = $(this);
			if (sessionUser.userID == 0) {
				OP.showJoinModal(function () {
					setupEditSketchPanel();
					activatePanel($this);
					$('input[name="parentID"]').val(sketch.visualID);
					$('input[name="saveAsNew"]').val('true');
				}, "Join to save your sketch");
			} else {
				setupEditSketchPanel();
				$('input[name="parentID"]').val(sketch.visualID);
				$('input[name="saveAsNew"]').val('true');
				activatePanel($this);
			}
		})
		//make it the default button if user is not the owner of the sketch
		d3.select('#forkSketchButton').classed('btn-primary', !owner).classed('btn-link', owner);

		$('#editSketchButton').on('click', function () {
			setupEditSketchPanel();
		})
		$('#forkThisSketchButton').on('click', function () { //this is the button under fork panel
			$('#forkThisSketchButton').button('loading');
			setupEditSketchPanel(false);
			$('input[name="parentID"]').val(sketch.visualID);
			$('input[name="saveAsNew"]').val('true');
			submitSketch();
		});


		//delete sketch behavior
		$('#deleteSketchLink').on('click', function () {
			$('#deleteSketchModal').modal('show');
			return false;
		});

		$('#deleteSketchModal .btn-primary').on('click', function () {
			var $btn = $(this).button('loading');

			$.getJSON('/sketch/' + sketch.visualID + '/delete_ajax')
				.done(function (response) {
					var message = response.message;
					OP.showMessageModal(message, function () {
						window.location.href = '/#sketches'
					});
				})
				.fail(
					function (response) {
						var message = response.responseJSON ? response.responseJSON.message : response.statusText;
						OP.showMessageModal(message);
					})
				.always(function (response) {
					$btn.button('reset');
					$('#deleteSketchModal').modal('hide');
				});

		});

		wannaSave();

		checkHeart();
	}


	//show tabs if sketch has multiple tabs
	checkIfTabsNeeded();

}
var quickSave = function () { //saves the sketch without page refresh or showing edit panel 
	setupEditSketchPanel(false); //setup form without showing the panel
	submitSketch(true); //save without refresh
}
var checkIfTabsNeeded = function () {
	if (sketch.currentVersion.codeObjects.length > 1) {
		$('#tabMode1').click();
	}
}

var resetSaveButtons = function () {


	$('#sideButtons').removeClass('loading');
	$('#saveSketchButton, #codeVersions .btn-primary')
		.removeClass('btn-success')
		.button('reset');

}

//submit sketch info to save
var submitSketch = function (quick) {
	var submitForm = new OPLiveForm({
		container: '#editSketchPanel',
		disableOnSubmit: false,
		onFail: function (message) {
			$('#saveSketchButton, #forkThisSketchButton').button('reset');
			$('#sideButtons').removeClass('loading');
			OP.showMessageModal("Couldn't save sketch:  " + message);
		},
		onSubmit: function () { //on submit
			$('#submitSketchButton, #quickSaveButton, #codeVersions .btn-primary').button('loading');
			$('#codeVersions .btn-default').remove();
			$('#forkThisSketchButton').button('loading');
			$('#sideButtons').addClass('loading');
		},
		onSuccess: function (response) { //on submit
			$('#sideButtons').removeClass('loading');

			if (response.success) {

				
				//verify code with hash
				if (verifyCodeHash(response.object.codeVerificationHash) !== true) {
					clog('server code', response.object.codeVerification);
					clog('hash does not match');
					$('#saveSketchButton, #forkThisSketchButton').button('reset');
					$('#sideButtons').removeClass('loading');
					OP.showMessageModal("Couldn't save sketch. Couldn't verify code match");
					return;

				}
				sketchChanged = false;

				$('#submitSketchButton, #quickSaveButton, #codeVersions .btn-primary')
					.addClass('btn-success')
					.button('success');

				wannaLeaveReset();
				if (!quick) {
					//wannaSaveReset();
					window.location.href = '/sketch/' + response.object.visualID;
				} else { //update any data on the page after quick save
					//get cursor position to prevent editor scroll jump
					// let currentCursorPos = getActiveEditor().doc.getCursor();
					// let currentScrollPos = getActiveEditor().getScrollInfo();
					// clog('currentCursorPos', currentCursorPos);

					//update versions
					window.sketch.versions = response.object.versions;
					createTempVersion();
					setupVersions();
					selectVersion();
					previewVersion(false); // don't do this to prevent code editor refreshes

					// clog('codeEditor.doc', getActiveEditor().doc);
					// getActiveEditor().focus();
					// getActiveEditor().doc.setCursor(currentCursorPos);
					// getActiveEditor().scrollTo(currentScrollPos.left, currentScrollPos.top);


					//after 3 seconds, flip buttons and show share icons
					window.setTimeout(function () {
						//$('#shareButtons').removeClass('flip');
						//$('#sideButtons').addClass('flip');
						$('#sideButtons').removeClass('show');
					}, 3000)
					window.setTimeout(function () {
						$('#quickSaveButton, #submitSketchButton').removeClass('btn-success').button('reset');
						$('#forkThisSketchButton').button('reset');
					}, 3400)

					$('#codeVersions li:nth-of-type(2)').addClass('flash');

				}
			}
		},
		submitURL: '/sketch/createSubmit_ajax/'
	});
	submitForm.submit();

}

var verifyCodeHash = function (hash) {
	clog('--Verifying code--');
	let textareas = d3.selectAll('.code');
	let allCode = '';
	textareas.each(function (d) {
		allCode += d.code;
	});
	let clientHash = CryptoJS.MD5(allCode).toString();
	clog('Client Code', allCode);
	clog('Server hash', hash);
	clog('Client hash', clientHash);
	return clientHash == hash;

}

var takeScreenshot = function () {
	//get canvas screenshot
	try {
		var canvas = $(sketchWindow.document).find("canvas");
		var imgURL = canvas[0].toDataURL("image/png");
		updateScreenshot(imgURL);
	} catch (e) {
		$('#screenshot').css('background-image', 'none');
		$('#screenshot + input').val('');
	}
}
var setupEditSketchPanel = function (showPanel) {

	if (showPanel !== false) {
		sketchEngine.pauseSketch(true);
		sketchConsole.show(false);
		toggleSidePanel(null);
		resetSaveButtons();
		$('#sideButtons').addClass('show').removeClass('flip');
		takeScreenshot();
	}


	//update with recent code
	//copy code without the editor, to be able to save
	saveCodeState();
	var code = sketch.currentVersion.codeObjects.map(function (d) {
		return {
			'title': d.title,
			'code': d.code,
			'visualCodeID': d.visualCodeID,
			'createdOn': d.createdOn,
			'visualID': d.visualID
		}
	});
	$('#editSketchPanel input[name="codeObjects"]').val(JSON.stringify(code));
	$('#editSketchPanel input[name="imports"]').val(getSketchImports());
	let uniqueCustomLibs = libraries.filter(
		function (l) {
			return l.custom && l.url != ''
		});
	uniqueCustomLibs = _.uniq(uniqueCustomLibs, false, _.iteratee('url'));
	$('#editSketchPanel input[name="customLibraries"]').val(JSON.stringify(uniqueCustomLibs));


	var submitForm = new OPLiveForm({
		container: '#editSketchPanel',
		submitURL: '/sketch/createSubmit/'
	});
	submitForm.enable();

	setupDropups();
	setupOPradios();
	$('#privacySetting input').on('change.checkFormDependencies ', checkFormDependencies);





	if (showPanel !== false) {
		activatePanel($('#editSketchButton'));
		$('#sideButtons').show();
		$('#editSketchPanel .sketchTitle').focus();
		$('body').removeClass('infoMode');
		$('body').removeClass('codeMode');
		$('body').removeClass('playMode');
		$('body').addClass('editMode');

	}

	if (sessionUser.membershipType == 0) {
		setupNonPlus();
	}
}

var setupOPradios = function () {
	var radios = $('.OPradio');
	radios.each(function () {
		setupOPradio(this);
	})
}
var setupOPradio = function (selector) {
	var radioGroup = $(selector);
	let radioGroupDescription = radioGroup.find('.description');
	let checkedLabel = $(selector).find('input:checked').parent('label');
	radioGroupDescription.text(checkedLabel.attr('data-description')); //update description text
	radioGroup.off('change').on('change', function () {
		setupOPradio(selector)
	});
}

var checkFormDependencies = function () {
	let activeInput = $('#privacySetting input:checked');
	if (activeInput.length) {
		let dependencies = JSON.parse(activeInput
			.parent('label')
			.attr('data-hiddenOptions'));
		let inputs = $("input[name='hideSourceCode']");
		let labels = inputs.parent('label');
		//first disable all
		labels.addClass('disabled');
		inputs.attr('disabled', 'true');

		//enable only applicable ones
		inputs.each(function () {
			if (dependencies.indexOf(+$(this).val()) > -1) {
				$(this).removeAttr('disabled');
				$(this).parent('label').removeClass('disabled');
			};
		});
		//select the first enabled one
		inputs.parent('label:not(.disabled)').first().click();
	}
}

var setupDropups = function () {
	var dropups = $('.dropup');

	dropups.each(function () {
		let dropup = $(this);
		dropup.find('li').off('click').on('click', function () {
			let name = $(this).text();
			let value = $(this).attr('value');
			let description = $(this).attr('description');
			dropup.find('.dropdown-toggle').text(name);
			dropup.prev('input').val(value);
			dropup.next('.description').text(description);
			dropup.removeClass('open');
		});
		dropup.find('li a').off('click').on('click', function () {
			return false;
		});

	})

}
var setupNonPlus = function () {
	var radios = $('.OPradio.plusOnly');
	radios.find('label').addClass('disabled');
	radios.find('input').attr('disabled', 'true');

	//disable toggles
	$('#editSketchPanel .plusOnly')
		.addClass('disabled');

	$('#privacySetting')
		.find('.dropup a')
		.css('color', '#aaa');

	$('#privacySetting')
		.find('.description')
		.html('<a href="/membership/" target="_blank">get Plus+</a> to change privacy settings');

	$('#hiddenSetting')
		.find('.description')
		.html('<a href="/membership/" target="_blank">get Plus+</a> to hide the source code')
		.css('opacity', 0.8);

	$('formItem.license')
		.find('.description')
		.html('learn more about <a href ="https://creativecommons.org/licenses/" target = "_blank"> Creative Commons </a><br/><a href="/membership/" target="_blank">get Plus+</a> to change the license')
		.css('opacity', 0.8);

	//disable license selection
	$('#editSketchPanel #licenseDropdown').remove();

	var license = $('#editSketchPanel formItem.license .field');
	license
		.html(license.text())
		.off('click')
}


//=====CODE FUNCTIONS=====

//prepare codeTabs + textarea filled with code
var setupCode = function () {
	//hide code if hidden
	if (+sketch.sourceHidden) {
		$('body').addClass('hideSourceCode');
	}


	//sort by creation date
	sketch.currentVersion.codeObjects = sketch.currentVersion.codeObjects.sort(function (a, b) {
		return a.createdOn > b.createdOn ? 1 : -1
	});

	//populate tabs
	var codeTabs = d3.select('#codeTabs ul').selectAll('li').data(sketch.currentVersion.codeObjects, function (d) {
		return d.visualCodeID
	});
	codeTabs.enter()
		.append('li')
		.text(function (d) {
			return d.title
		})
		.classed('selected', function (d, i) {
			return i === 0
		})
		.on('click', function (d, i) {
			var codePanes = d3.selectAll('#codePanel .codePane');
			d3.selectAll('#codeTabs ul li').classed('selected', false);
			d3.select(this).classed('selected', true);
			codePanes.classed('selected', false);
			codePanes.filter(function (c) {
				return c == d
			}).classed('selected', true);
			d.editor.refresh();
		})
		.on('dblclick', function (d, i) { //add textfield on dblclick
			var $t = $(this);
			var self = this;
			if (!$t.hasClass('edit')) {
				$t.attr('contentEditable', 'true')
					.addClass('edit')
					.focus()
					.on('blur', function () {
						//reset if empty
						if ($t.text().trim().length === 0) {
							$t.text(d3.select(this).datum().title);
						} else {
							d3.select(this).datum().title = $t.text();
							wannaSave(true);
						}
						$t.attr('contentEditable', 'false').removeClass('edit')
							.scrollLeft(0); //to reset the position of the text in label
					})
					.on('keydown', function (e) { //disable new line
						OP.check_charcount(this, 25, e);
						return e.which != 13;

					});
			}
			return false;
		})
		.append('div') //close icon for tabs
		.attr('class', 'icon icon_x_small_dark tabCloseButton')
		.on('click', function (d, i) {
			$('#deleteTabModal .btn-primary').on('click', function () {
				wannaSave(true);
				sketch.currentVersion.codeObjects = _.without(sketch.currentVersion.codeObjects, d);
				$('#deleteTabModal').modal('hide');
				setupCode();
				$('#codeTabs li:last-of-type').click(); //select the last tab;
			});
			$('#deleteTabModal').modal('show');
		})

	codeTabs.exit().remove();



	//populate panes
	var codePanes = d3.select('#codePanel .codeContainer').selectAll('div.codePane')

	var codePanesData = codePanes.data(sketch.currentVersion.codeObjects, function (d) {
		return d.visualCodeID + Math.random();
	});
	codePanesData.enter()
		.append('div')
		.classed('codePane', true)
		.classed('selected', function (d, i) {
			return i === 0
		})
		.append('textarea')
		.classed("col-md-12 code", true)
		.attr({
			'autocorrect': "off",
			'autocapitalize': "off",
			'spellcheck': "false"
		})
	d3.selectAll('#codePanel textarea.code')
		.text(function (d) {
			return d.code
		}).each(function (d) {
			setupEditor(this);
			d.editor.refresh();
		});

	codePanesData.exit().remove();

	// d3.selectAll('.codePane textarea')
	// 	.selectAll('textarea')
	// 	.each(function (d) {
	// 		setupEditor(this);
	// 		d.editor.refresh();
	// 	});

	//set add behavior
	d3.select('#addCodeButton').on('click', null);
	d3.select('#addCodeButton').on('click', function () {
		wannaSave(true);
		var tabNo = (sketch.currentVersion.codeObjects.length + 1);
		var newCode = {
			createdOn: OP.dateSQL(),
			title: "tab" + tabNo,
			updatedOn: '',
			visualCodeID: -sketch.visualID - tabNo, //keep minus IDs for new tabs
			visualID: sketch.visualID
		};
		sketch.currentVersion.codeObjects.push(newCode);
		setupCode();
		$('#codeTabs ul li:last').click();
	});

}

var setupEditor = function (textarea) {
	var datum = d3.select(textarea).datum();
	//trim whitespace
	d3.select(textarea)
		.html(function (d) {
			return d3.select(this).html().trim()
		})
	window.codeEditor = CodeMirror.fromTextArea(textarea, {
		lineNumbers: true,
		mode: "javascript",
		theme: 'neo',
		toggleComment: true,
		keyMap: 'sublime',
		indentWithTabs: true,
		tabSize: 2,
		foldGutter: true,
		fixedGutter: false,
		foldOptions: {
			widget: '\u2026'
		},
		gutters: ['CodeMirror-foldgutter']
	});
	codeEditor.on('blur', function (instance) {
		saveCodeState();
	});
	codeEditor.on('beforeChange', function (instance) {
		sketchChanged = codeChanged = true;
		wannaSave();

	});

	codeEditor.refresh();
	d3.select(textarea).datum().editor = codeEditor;
}

var saveCodeState = function () {
	let textareas = d3.selectAll('.code');
	textareas.each(function (d) {
		d.editor.save();
		d.code = d.editor.doc.getValue();
	});
	setupVersions();
}

var formatCode = function () {
	if (sketch.isPjs == 2) {
		window.codeEditor.doc.setValue(js_beautify(window.codeEditor.doc.getValue(), {
			indent_with_tabs: true
		}));
	}
}


var toggleCodeOptions = function () {
	if (codeOptionsEnabled) { //turn off
		$('#codePanel .codeOptions')
			.removeClass('active')
		$('#codePanel, body').removeClass('codeOptionsActive');
	} else {
		$('#codePanel .codeOptions')
			.addClass('active')
		$('#codePanel, body').addClass('codeOptionsActive');
		setupAds();
	}
	codeOptionsEnabled = !codeOptionsEnabled;
}
var setupCodeOptions = function () {
	//setup handle
	$('#codePanel .codeOptions .icon_edit_dark').on('click', function () {
		toggleCodeOptions();
	})

	//setup tabs
	$('.codeOptions .nav-tabs a').click(function (e) {
		e.preventDefault()
		$(this).tab('show');

		//load ajax if not loaded
		if ($(this).attr('href') == '#sketchFiles' && !filesLoaded) {
			setupSketchFiles();
		}

		//load ajax if not loaded
		if ($(this).attr('href') == '#codeReference' && !referenceLoaded) {
			setupCodeReference();
		}



		return false;
	})

	//set sketch Mode
	var firstTime = true; //flag to not mark codechange
	$('#sketchModeOptions input[name="sketchMode"]').on('change', function () {
		sketch.mode = sketch.isPjs = $('#sketchModeOptions input[name="sketchMode"]:checked').val();
		$('#editSketchPanel input[name="mode"]').val(sketch.mode);
		sketchChanged = codeChanged = !firstTime;
		wannaSave();
		//hide ref if not p5js
		d3.select($('a[href="#codeReference"]').parent().get()[0]).classed('hide', +sketch.mode != 2);

		//hide custom libraries if not p5js
		//d3.select('#addCustomLibraryLink').classed('hide', +sketch.mode != 2);

		setupEngineVersions();

		//update libraries shown
		setupDefaultLibraries();
		setupCustomLibraries();

	});

	//select if pjs or p5js
	$('input[name="sketchMode"][value="' + sketch.isPjs + '"]').click();
	firstTime = false;



	//tab Mode
	$('#tabModeOptions input[name="tabMode"]')
		.on('change', function () {
			//get value as show hide
			tabMode = $('#tabModeOptions input[name="tabMode"]:checked').val();
			d3.select('#codeTabs').classed('show', tabMode === "true");
			d3.select('.codeContainer').classed('tabPadding', tabMode === "true");

		});
	//select the current mode
	$('#tabModeOption0').parent('label').click(); //bounce is the default option

	//tab Mode
	$('#libraryHeader a')
		.on('click', function () {
			libraryMode = $(this).attr('data-value');
			d3.select('#defaultLibraries').classed('summary', libraryMode != "true");
			$('#libraryHeader a').removeClass('hide');
			$(this).addClass('hide');
			return false;

		});
	//select the current mode
	$('#libraryModeOption0').parent('label').click(); //bounce is the default option


	//text side 
	$('#textSizeSlider').on('input change', function () {
		let val = $(this).val();
		$('#codePanel .codeContainer, #codePanel .code').css('font-size', val + 'px');
		sketch.currentVersion.codeObjects.forEach(function (d) {
			d.editor.refresh();
		});
		OP.cookie.setItem('editor-font-size', val);

	});

	//text side 
	$('#textSizeSlider').on('dblclick', function () {
		$(this).val(16);
		$('#codePanel .codeContainer, #codePanel .code').css('font-size', '16px');
		sketch.currentVersion.codeObjects.forEach(function (d) {
			d.editor.refresh();
		});
		OP.cookie.setItem('editor-font-size', 16);

	});

	if (OP.cookie.getItem('editor-font-size')) {
		let val = OP.cookie.getItem('editor-font-size');
		$('#textSizeSlider').val(val).change();
	}

}
var codeReferenceData = [];
var setupCodeReference = function () {
	var dom = d3.select('#codeReference');
	dom.classed('loading', true);
	if (!referenceLoaded) {
		var list = dom.append('div');
		d3.json('/api/reference/p5js', function (ref) {
			dom.classed('loaded', true);
			referenceLoaded = true;
			codeReferenceData = ref.classitems;
			dom.classed('loading', false);
			showCodeReference();
		})
	}
	dom.select('input').on('keyup', function () {
		showCodeReference($(this).val())
	});

}
var showCodeReference = function (find) {
	let filteredData = codeReferenceData;
	filteredData = filteredData
		.filter(function (d) {
			return d.class == 'p5'
		});
	if (typeof find != 'undefined' && find != '') {
		filteredData = filteredData
			.filter(function (d) {
				return typeof d.name != 'undefined' && d.name.indexOf(find) > -1
			});
	}

	let classData = d3.nest()
		.key(function (d) {
			return d.module
		})
		.entries(filteredData);

	//sort and filter out p5.dom and p5.sound
	classData = classData
		.filter(function (d) {
			return d.key != 'undefined' && d.key != 'p5.dom' && d.key != 'p5.sound'
		})
		.sort(function (a, b) {
			return a.key > b.key ? 1 : -1
		});

	let classes = d3.select('#codeReference div').selectAll('ul').data(classData, function (d) {
		return d.key
	});
	classes.enter()
		.append('ul')
		.text(function (d) {
			return d.key
		})
	classes.each(function (d, i) {
		let c = d3.select(this).selectAll('li').data(d.values, function (d) {
			return d.class + d.name
		});
		c.enter()
			.append('li')
			.append('a')
			.attr('href', function (d) {
				//if(!d.name){ clog(d);}
				return 'http://p5js.org/reference/#/p5/' + d.name
			})
			.attr('target', '_blank')
			.text(function (d) {
				return d.name
			})
		c.exit().remove();
		d3.select(this).selectAll('li').sort(function (a, b) {
			return a.name > b.name ? 1 : -1
		});

	})

	classes.exit().remove();
	d3.selectAll('#codeReference ul').sort(function (a, b) {
		return a.key > b.key ? 1 : -1
	});
}
var setupInfoPanel = function () {

	$('#infoPanel .bg').on('click:returnToPlay', function () {
		$('#mainControls .icon_play').click();
	});
	if (owner) {
		$('#editSketchButton').on('click', function () {
			setupEditSketchPanel();
			$('input[name="saveAsNew"]').val('false'); //set fork as default saving mode
		});

	} else {
		$('#editSketchButton').remove();
	}


	//remove empty fields
	$('#infoPanel .hideIfEmpty').each(function () {
		if ($(this).text().trim().length === 0) {
			$(this).remove();
		}
	});


}

var loadForks = function () {
	var forkList = function (container, data) {
		var li = d3.select(container).append('ul').selectAll('li').data(data)
			.enter()
			.append('li')
			.style('opacity', 0);
		var textContent = li.append('div').classed('textContent', true);
		textContent.append('a')
			.classed('sketchTitle', true)
			.attr('href', function (d) {
				return '/sketch/' + d.visualID
			})
			.text(function (d) {
				return d.title
			});
		textContent.append('span')
			.text('by');
		textContent.append('a')
			.classed('userName', true)
			.attr('href', function (d) {
				return '/user/' + d.userID
			})
			.text(function (d) {
				return d.fullname
			});
		li.each(function (d) {
			if (d.forks.length > 0) {
				forkList(this, d.forks);
			}
		});
	}
	if (!forksLoaded) {
		$('#noForkMessage').text('Loading forks...');
		d3.json('/sketch/' + sketch.visualID + '/getForks_ajax', function (response) {
			sketch.forks = response.object;
			//check if empty
			if (sketch.forks.length > 0) {
				$('#noForkMessage').addClass('hide');
			} else {
				$('#noForkMessage').text('No forks created yet.');

			}
			forkList('#forkListContainer', sketch.forks);
			$('#forkCount').text($('#forkListContainer li').length);

			//transition
			d3.selectAll('#forkListContainer li')
				.transition().duration(function (d, i) {
					return i * 100;
				})
				.style('opacity', 1);
			forksLoaded = true;
		});
	}
}
var setupComments = function () {

	$('#cantComment a').on('click', function () {
		OP.showJoinModal(function () {}); //give empty function to prevent page refresh
		return false;
	})

	let comments = d3.select('.comments').selectAll('.comment')
		.data(sketch.comments, function (d) {
			return d.commentID
		});
	let commentsEnter = comments
		.enter()
		.append('div')
		.classed('comment', true)
		.classed('col-sm-12', true)
		.classed('summarize', function (d) {
			return d.body.length > 120
		})

	commentsEnter.append('h3').attr('class', "commentName bariol")
		.append('a')
		.attr('href', function (d) {
			return "/user/" + d.userID
		})
		.text(function (d) {
			return d.fullname
		})
		.append('hr')

	commentsEnter.append('div')
		.attr('class', "commentBody")
		.html(function (d) {
			return d.body
		})
	commentsEnter.append('a')
		.classed('readMoreLink', true)
		.attr('href', '#')
		.text('Read more')
		.on('click', function () {
			$(this).closest('.comment').removeClass('summarize');
			return false;
		});

	let commentMeta = commentsEnter.append('div').attr('class', "commentMeta")

	commentMeta.append('div').classed('commentDate', true).text(function (d) {
		return d.date
	});

	let commentActions = commentMeta.append('div').classed('commentActions', true);
	commentActions.append('div').attr('class', 'icon icon_flag')
		.on('click', function (d) {
			$('#flagCommentModal .btn-danger').attr('data-commentID', d.commentID);
			$('#flagCommentModal').modal();
		})
	commentActions.append('div').attr('class', 'icon icon_delete')
		.classed('hide', function (d) {
			return !(owner || sessionUser.userID == d.userID)
		})
		.on('click', function (d) {
			sketch.comments = sketch.comments.filter(function (c) {
				return d.commentID != c.commentID
			});
			setupComments();
			//do ajax call
			$.getJSON('/sketch/' + sketch.visualID + '/deleteComment_ajax/' + d.commentID)
				.done(function (response) {
					clog(response);
				})
				.fail(
					function (response) {
						var message = response.responseJSON ? response.responseJSON.message : response.statusText;
						OP.showMessageModal(message);

					})
				.always(function (response) {

				});
		})

	//update
	d3.select('.comments').selectAll('.comment')
		.classed('flagged', function (d) {
			return d.isFlagged
		});

	comments.exit().transition()
		.duration(400).style('height', 0).style('opacity', 0)
		.delay(800).remove();



	//setup flagging modal
	$('#flagCommentModal .btn-danger').on('click', function () {
		var $btn = $(this).button('loading');
		var commentID = $btn.attr('data-commentID');
		var type = $btn.attr('data-type');

		$.getJSON('/sketch/' + sketch.visualID + '/flagComment_ajax/' + commentID + '/' + type)
			.done(function (response) {
				if (owner) {
					let comment = sketch.comments.filter(function (d) {
						return d.commentID == commentID
					})[0];
					comment.isFlagged = 1;
					setupComments();
				} else {
					var message = response.message;
					OP.showMessageModal(message);
				}
			})
			.fail(
				function (response) {
					var message = response.responseJSON ? response.responseJSON.message : response.statusText;
					OP.showMessageModal(message);
				})
			.always(function (response) {
				$btn.button('reset');
				$('#flagCommentModal').modal('hide');
			});

	});

}
var setupFollow = function () {
	d3.select('#followLink').classed('following', user.isFollowed);
	let followButton = $('#followLink');

	followButton.on('click', function () { //only allow following users

		if (+sessionUser.userID === 0) {
			//toggle sign in here
			OP.showJoinModal(function () {
				followUser(true);
			});
		} else if (user.isFollowed !== true) {
			followUser(true);
		}
		return false;
	});


}
var followUser = function (bool) {
	let followButton = $('#followLink');
	followButton.addClass('loading');
	$.ajax({
			dataType: 'json',
			url: '/user/follow_ajax/' + user.userID + '/' + bool + '/',
			cache: false
		})
		.done(function (response) {
			followButton.addClass('following');
			user.isFollowed = bool;
		})
		.fail(
			function (response) {
				clog(response);
				var message = (response.responseJSON) ? response.responseJSON.message : 'Problem with following user.';
				OP.showMessageModal(message);
			})
		.always(function (response) {
			followButton.removeClass('loading');
		});
}
var setupAddComment = function () {
	var textAreaSettings = {
		allowHTML: false, //allow HTML formatting with CTRL+b, CTRL+i, etc.
		allowImg: false, //allow drag and drop images
		singleLine: false, //make a single line so it will only expand horizontally
		pastePlainText: true, //paste text without styling as source
		placeholder: newCommentEmptyValue //a placeholder when no text is entered. This can also be set by a placeholder="..." or data-placeholder="..." attribute
	}
	$('.newComment .textarea')
		.toTextarea(textAreaSettings)
		.toTextarea('enable')
		.on('focus', function () {
			$(this).removeClass('empty');
			$('.newCommentContainer, .comments').addClass('active');
			$('.newComment .buttonContainer')
				.addClass('fadeInFromNone');
		})
		//        .on('keydown', function (e) {
		//            //submit if command+return
		//            if (e.keyCode == 13 && (e.ctrlKey || e.metaKey)) {
		//                $('.newComment .buttonContainer .btn-primary').click();
		//            }
		//        })
		.on('blur', function () {
			// WebKit contentEditable focus bug workaround:
			$('<div contenteditable="true"></div>')
				.appendTo('body').focus().remove()

			if ($(this).text().trim().length === 0) {
				//$('.newComment .buttonContainer').addClass('fadeOutToNone').removeClass('fadeInFromNone');
				$('.newCommentContainer, .comments').removeClass('active');
				$(this).addClass('empty') //.html(newCommentEmptyValue);
			} else {
				$(this).removeClass('empty');
			}
		})
	Mousetrap($('.newComment .textarea')[0]).bind('command+return', function (e) {
		$('.newComment .buttonContainer .btn-primary').click();
		return false;
	});

	//setup code snippets
	setupCodeSnippets();


	//setup submit
	$('.newComment .buttonContainer .btn-primary').on('click', function () {
		$('.newCommentContainer, .comments').removeClass('active');
		//change any <div>s to new line
		var tempContainer = $('.newComment .textarea').clone()
		tempContainer.find('div').html(function () {
			return '&lt;newline&gt;' + $(this).html();
		});
		var commentBody = htmlEntities(tempContainer.text());
		//add back code section
		commentBody = commentBody.replace(/&lt;newline&gt;/g, '<br/>')
		commentBody = commentBody.replace(/&lt;code&gt;/g, '<code>')
		commentBody = commentBody.replace(/&lt;\/code&gt;/g, '</code>');

		$('.newComment .textarea').addClass('loading');
		let submitButton = $(this).prop('disabled', true);

		$.ajax({
				url: '/sketch/' + sketch.visualID + '/postComment_ajax',
				dataType: 'json',
				method: 'post',
				data: {
					'commentBody': commentBody
				}

			})
			.done(function (result) {
				if (result.success) {
					appendComment(result.object);
				}
			})
			.fail(function () {
				OP.showMessageModal('There was an error posting your comment. Please try again later');
			})
			.always(function () {
				$('.newComment .textarea').removeClass('loading');
				submitButton.prop('disabled', false);
			});

	});

	//setup cancel
	$('.newComment .buttonContainer .btn-secondary').on('click', function () {
		$('.newComment .textarea').html('').trigger('blur');

	});




}
var setupCodeSnippets = function () {
	$('.comments code,.library code')
		.off('click')
		.on('click', function () {
			var content = $(this).html();
			$("#codeSnippetModal .modal-body").html(content);
			$("#codeSnippetModal").modal();
		})
}

/* Make the given section copy-able */
var setupCopyArea = function (container) {
	var copyLink = container.find('.copyLink');
	var copyContent = container.find('.copyContent');

	copyLink.on('click', function () {
		//copy to clipboard
		var $temp = $("<input>")
		$("body").append($temp);
		$temp.val(copyContent.text()).select();
		document.execCommand("copy");
		$temp.remove();
		//flash text
		flashText(container, 'Copied', 'Click to copy');
	});
}
var flashText = function (container, text, defaultText) {
	let copyLink = container.find('.copyLink');
	let copyContent = container.find('.copyContent');

	copyLink.text(text);
	copyContent.addClass('flash');
	window.setTimeout(function () {
		copyContent.removeClass('flash');
	}, 100);
	window.setTimeout(function () {
		copyLink.text(defaultText);
	}, 10000);
}
var setupEmbed = function () {
	$('#shareButtons_embed').click(function () {
		$('#sideControls .icon_share').click();
		window.setTimeout(function () {
			$('#share_embed .copyLink').click();
		}, 400);
		return false;
	});
	setupCopyArea($('#share_embed'));

	//todo remove This
	//sessionUser.membershipType = 0;
	if (sessionUser.membershipType > 0) {
		let setEmbedURL = function () {
			let embedURL = location.origin + "/sketch/" + sketch.visualID + "/embed/?plusEmbedHash=" + sketch.embedHash;
			$('#plusEmbedOptions').find('input:checked').each(function () {
				let optionName = $(this).prop('name');
				embedURL += '&' + optionName + '=true';
			})
			let embedText = '<iframe src="' + embedURL + '" width="400" height="300"></iframe>';
			$('#share_embed .copyContent').text(embedText).data('url', embedURL); //update the embed text
			flashText($('#share_embed'), 'Link updated', 'Click to copy'); //flash the text
		}
		$('#plusEmbedOptions').find('input').change(function (d) {
			setEmbedURL();
		})
		setEmbedURL();
	} else { //disable the embed options and set url to default
		$('#share_embed').find('input').prop('disabled', 'disabled');
		let embedURL = location.origin + "/sketch/" + sketch.visualID + "/embed/";
		let embedText = '<iframe src="' + embedURL + '" width="400" height="300"></iframe>';
		$('#share_embed .copyContent').text(embedText).data('url', embedURL); //update the embed text
	}

	$('#share_embed .icon_share_small').on('click', function () {
		$(this).prop('href', $('#share_embed .copyContent').data('url'));
	})
}
var setupShare = function () {
	setupCopyArea($('#share_attribute'));
	if (sketch.license && sketch.license != 'none') {
		//setup attribution info
		var attrText = '"' + sketch.title + '" by ' + user.fullname + '\n';
		attrText += 'http://www.openprocessing.org/sketch/' + sketch.visualID + '\n';
		attrText += 'Licensed under ' + sketch.licenseObject.name + '\n';
		attrText += sketch.licenseObject.url + '\n';
		attrText += 'https://creativecommons.org/licenses/GPL/2.0/';
		$('#attributionText').text(attrText);
	} else {
		$('#share_attribute').remove();
	}

}
var dz; //dropzone global
var setupSketchFiles = function () {
	let scrollToFile = function () {
		$('#sketchFiles').scrollTop($('.file.inProgress').position().top + $('#sketchFiles').scrollTop() - 50); //scroll to the file in the list to display progress.
	};
	sketch.files = [];

	if (sketch.userID == sessionUser.userID && sketch.isPjs > 0 && sketch.visualID > 0) {
		let fileTypes = ".gif,.jpg,.jpeg,.png,.csv,.tsv,.json,.mov,.ogg,.webm,.mp3,.mp4,.mid,.midi,.wav,.txt,.svg,.otf,.ttf,.obj";
		fileTypes += sessionUser.membershipType > 0 ? ',.js' : ''; //add js for members

		$('#fileTypes').attr('title', fileTypes.replace(/\./g, ' ')).tooltip('fixTitle');
		//setup drop zone
		Dropzone.autoDiscover = false;
		dz = new Dropzone("#sketchFiles", {
			url: "/sketch/" + sketch.visualID + "/files",
			parallelUploads: 1,
			maxFilesize: 250,
			acceptedFiles: fileTypes,
			addRemoveLinks: false,
			clickable: '#uploadFileButton',
			dictFileTooBig: "File is too big ({{filesize}} MB). You have only {{maxFilesize}} MB available."

		});


		dz
			.on('addedfile', function (file) {
				console.log('added');
				sketch.files.push({
					name: file.name,
					date: file.lastModified,
					size: file.size,
					progress: 0,
					inProgress: true
				});
				listFiles();
			})
			.on('uploadprogress', function (f, progress, bytesSent) {
				clog(f, progress);
				var file = sketch.files.filter(function (d) {
					return d.name == f.name
				})[0];
				file.inProgress = true;
				file.progress = progress;
				listFiles();
				scrollToFile();

				console.log('success', file);
			})
			.on('success', function (f, response) {
				var file = sketch.files.filter(function (d) {
					return d.name == f.name
				})[0];
				//update File name with the one returned from the server
				var newFileName = JSON.parse(response).object.name;
				file.name = newFileName;
				file.inProgress = false;
				file.progress = 100;
				listFiles();
				console.log('success', file);

			})
			.on('queuecomplete', function () {
				checkQuota();
			})
			.on('error', function (file, mesg) { //client level msg is thrown with mesg
				var message = file.xhr ? JSON.parse(file.xhr.response).object : mesg;
				var li = d3.selectAll('#sketchFiles li').filter(function (d) {
						return d.name == file.name
					})
					.classed('error', true)
				li.select('.errorMessage')
					.html(message);
				scrollToFile();
				window.setTimeout(function () {
					sketch.files = sketch.files.filter(function (f) {
						return f.name != file.name
					});
					listFiles();
				}, 10000);

			})
			.on('dragenter', function (e) {
				$('#sketchFiles').addClass('fileOver');
			})
			.on('dragend', function (e) {
				$('#sketchFiles').removeClass('fileOver');
			}).on('drop', function (e) {
				$('#sketchFiles').removeClass('fileOver');
			});
		checkQuota();
	}


	//list all files for the first time
	$.getJSON('/sketch/' + sketch.visualID + '/files/')
		.done(function (response) {
			if (response.object) {
				//object is an 'array' with keys as filenames. Convert to standard array as 0,1,2...
				sketch.files = $.map(response.object, function (value, index) {
					return [value];
				});;
				sketch.files.forEach(function (d) {
					d.inProgress = false
				});
				listFiles();
				filesLoaded = true;
			}
		})
		.fail(
			function (response) {
				var message = response.responseJSON ? response.responseJSON.message : response.statusText;
				clog('error: ', message);
			})
		.always(function (response) {

		});



}
var quotaXHR;
var checkQuota = function () {
	if (quotaXHR) {
		quotaXHR.abort()
	};
	var setupQuota = function (quota) {
		let barScale = d3.scale.linear().domain([0, quota.limit]).range([0, 100]).clamp(true);

		var available = quota.limit - quota.total;
		available = Math.round(available / 1000 * 10) / 10;
		var avText = available >= 0 ? available + ' MB available' : Math.abs(available) + ' MB over limit';
		$('#quotaAvailable').text(avText);
		d3.select('#quotaBar').style('width', barScale(quota.total) + '%');
		dz.options.maxFilesize = Math.min(250, available);

	}
	//display quota
	quotaXHR = $.getJSON('/user/' + sessionUser.userID + '/quota/')
		.done(function (response) {
			clog(response.object);
			setupQuota(response.object);
		})
		.fail(function (response) {
			clog(response.responseJSON);
			setupQuota(response.responseJSON.object);
		})
		.always(function (response) {

		});

}

var listFiles = function () {
	var fileLi = d3.select('#sketchFiles ul').selectAll('li');
	var fileLiData = fileLi.data(sketch.files, function (d) {
		return d.name;
	});

	fileLiEnter = fileLiData
		.enter()
		.append('li')
		.classed('file', true)
		.classed('inProgress', function (d) {
			return d.inProgress
		})


	fileLiEnter.append('a')
		.attr('target', '_blank');
	fileLiEnter.append('span')
		.attr('class', 'fileSize')
		.html(function (d) {
			return '' + Math.round(d.size / 1024 / 1024 * 100) / 100 + ' mb'; //round to single decimal
		});
	fileLiEnter.append('div')
		.classed('icon_delete', true)
		.on('click', function (d) {
			deleteFile(d);
			sketch.files = sketch.files.filter(function (f) {
				return f.name != d.name
			});
			listFiles();
		});
	fileLiEnter.append('div')
		.classed('errorMessage', true);
	fileLiEnter.append('div')
		.classed('progressBar', true)
		.style('width', function (d) {
			return d.progress + '%'
		});

	d3.select('#sketchFiles ul').selectAll('li')
		.classed('inProgress', function (d) {
			return d.inProgress
		})
		.selectAll('a')
		.attr('href', function (d) {
			// return '/sketch/' + sketch.visualID + '/files/' + d.name
			return sketch.fileBase + d.name;
		})
		.attr('title', function (d) {
			return d.name
		})
		.text(function (d) {
			return d.name
		})
	d3.select('#sketchFiles ul').selectAll('li').selectAll('.progressBar')
		.style('width', function (d) {
			return d.progress + '%'
		});


	fileLiData.exit().transition().style('opacity', 0).remove();

}
var deleteFile = function (d) {
	//remove given file
	$.ajax({
			url: '/sketch/' + sketch.visualID + '/files/',
			cache: false,
			dataType: 'json',
			method: 'post',
			data: {
				action: 'delete',
				filename: d.name
			}
		})
		.done(function (response) {
			clog(response);
		})
		.fail(function (response) {

		})
		.always(function (response) {
			checkQuota();
		});
}
var appendComment = function (comment) {
	//scroll comments to bottom
	$('.comments').scrollTop($('.comments').get()[0].scrollHeight);
	comment.date = 'Just now';
	sketch.comments.push(comment);
	setupComments();
	setupCodeSnippets();

	//reset new comment box
	$('.newComment .textarea')
		.html('').blur()


	//smooth scroll comments to bottom to reveal
	$('.comments').animate({
		scrollTop: $('.comments').get()[0].scrollHeight
	}, 1000);
}

function htmlEntities(str) {
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var activatePanel = function (icon) {

	$('#mainControls .icon').removeClass('selected');
	$('#saveSketchButton').removeClass('selected');
	$(icon).addClass('selected');

	var target = $(icon).attr('data-target');
	//show panel
	$('.panel, #sketch').removeClass('active').addClass('inactive');
	$(target).removeClass('inactive').addClass('active');
}

var setupControls = function () {
	//MAIN CONTROLS


	$('#mainControls .icon_info').on('click', function () {
		$('body').addClass('infoMode');
		$('body').removeClass('playMode');
		$('body').removeClass('codeMode');
		$('body').removeClass('editMode');
		$('#saveSketchButton').button('reset');

		sketchEngine.slowdownSketch(false);
		sketchEngine.pauseSketch(true);

		sketchConsole.show(false); //hide the console

		activatePanel(this);
		OP.setupImageLoading('#infoPanel .userThumb');
		$('body').scrollTop(0)
		//        $('.navbar').removeClass('fade2Sketch');
	})
	$('#mainControls .icon_code').on('click', function () {
		$('body').removeClass('infoMode');
		$('body').removeClass('playMode');
		$('body').removeClass('editMode');
		$('body').addClass('codeMode');

		sketchEngine.pauseSketch(true);
		activatePanel(this);
		//sketchConsole.show(true);

		wannaSave();
		sketch.currentVersion.codeObjects.forEach(function (d) {
			d.editor.refresh();
		});
		$('body').scrollTop(0);
		window.setTimeout(function () {
			codeEditor.focus();
		}, 200); //leave time until visible

		//        $('.navbar').removeClass('fade2Sketch');
	})
	$('#mainControls .icon_play').on('click', function () {
		$('body').focus();
		$('body').removeClass('infoMode');
		$('body').addClass('playMode');
		$('body').removeClass('codeMode');
		$('body').removeClass('editMode');
		$('#saveSketchButton').button('reset');

		sketchEngine.pauseSketch(false);
		sketchEngine.slowdownSketch(false);
		activatePanel(this);

		if ($(this).hasClass('selected')) {
			//if it is the active tab, just play/pause the sketch
			//sketchEngine.pauseSketch(sketchPlaying);
			sketchConsole.clear();
			sketchEngine.restartSketch(null, true);
			clog('restart');
		} else {
			clog('play');
			//if it is not active tab, then become active, and reload sketch if code is changed
			if (codeChanged) {
				sketchConsole.clear();
				sketchEngine.runSketch(null, true); //give focus
				codeChanged = false;

			}
		}
		wannaSave();
		$('#sideControls').show();




		//        $('.navbar').addClass('fade2Sketch');
		$('body').scrollTop(0)
	});

	//SIDE CONTROLS
	$('#sideControls .metric').on('click', function () {
		toggleSidePanel(this);
		if ($(this).attr('data-target') == "#forkSidePanel") {
			//ajax load forks data;
			loadForks();
		}
		if ($(this).attr('data-target') == "#heartSidePanel") {
			//ajax load forks data;
			OP.setupImageLoading('#heartSidePanel .userThumb');
		}
	})

	$('#sideControls .icon_heart').on('click', heartSketch);



	//on comment, open comment panel, and put cursor on comment box
	$('#sideControls .icon_comment').on('click', function () {
		var self = this;
		$(this).next('.metric').click();
		window.setTimeout(function () {
			if ($(self).parent().hasClass('selected')) {
				$('.newComment .textarea').get(0).focus(); //chrome fix
				//$('.newComment .textarea').focus();

			} else {
				$('.newComment .textarea').blur();
			}

		}, 200);

	})
	$('#sideControls .icon_fork').on('click', function () {
		$(this).next('.metric').click();
	});
	$('#sideControls .icon_share').on('click', function () {
		$(this).next('.metric').click();

	});

	//Fullscreenbutton
	$('.icon_fullscreen').click(function () {
		$(this).toggleClass('selected');
		$('body').toggleClass('fullscreen');

	});


}

var getActiveEditor = function () {
	return d3.selectAll('.codePane.selected').datum().editor;
}

var toggleSidePanel = function (container) {
	//unselect others
	$('#sideControls .metric').not(container).parent().removeClass('selected');

	//toggle select for the current one
	$(container).parent().toggleClass('selected');


	//show panel
	var target = $(container).attr('data-target');
	$('.sidePanel').not(target).removeClass('active').addClass('inactive');
	$(target).toggleClass('active').toggleClass('inactive');

	//setup navbar hide behavior on select/unselect
	if ($('.metricGroup.selected').length > 0) {
		//        $('.navbar').removeClass('fade2Sketch');
		$('.navbar').addClass('opaque');
	} else if ($('#mainControls .icon_play').hasClass('selected')) {
		//        $('.navbar').addClass('fade2Sketch');
		$('.navbar').removeClass('opaque');
	}
}
var setupAddToClass = function () {
	let classes = d3.select('#classesDD').selectAll('li').data(sessionUser.classes);
	classes.enter()
		.append('li')
		.text(ff('title'))
		.on('click', function (c) {
			//show add to class modal	http://op.localhost:8888/api/collection/2014/true
			$('#addToClassModal').modal('show').addClass('loading');
			d3.selectAll('#addToClassModal li').remove(); //clear the list
			d3.json('/api/collection/' + c.collectionID + '/true',
				function (response) { //show addToClass Modal with subcollections
					$('#addToClassModal').removeClass('loading');
					let c = response.collection;

					//add itself as the top collection
					if (c.collections.length == 0) {
						let itself = {
							'title': 'Main Class Collection',
							'collectionID': c.collectionID
						};
						c.collections.push(itself);
					}
					c.collections.sort(ff('orderID'));
					let cc = d3.select('#addToClassModal ul').selectAll('li').data(c.collections);
					let ccli = cc.enter()
						.append('li')
						.classed('collectionSummary', true)
						.classed('alreadySubmitted', function (sc) {
							return c.sketches.filter(function (s) {
								return s.visualID == sketch.visualID && s.collectionID == sc.collectionID
							}).length > 0
						})
						.on('click', function (subc) { //on select
							let self = this;
							//add sketch to the list with loading icon on it
							let thisSketch = {
								'visualID': sketch.visualID,
								'userID': sketch.userID,
								'collectionID': subc.collectionID,
								'submittedOn': "0", //give a past date to list it first
								'loading': true,
								'fullname': user.fullname,
								'isPjs': sketch.isPjs,
								'title': sketch.title

							};
							let sketches = c.sketches.filter(ff('collectionID', subc.collectionID)).slice(0, 13);
							sketches.unshift(thisSketch);
							clog(sketches);
							OP.listSketches($(this).find('ul.sketchList').get()[0], sketches, 'col-xs-1');
							d3.select(self).selectAll('li')
								.sort(function (a, b) {
									return a.submittedOn + a.visualID > b.submittedOn + b.visualID ? 1 : -1
								})
								.classed('loading', ff('loading', true));
							// submit sketch to the curation
							$.post('/class/' + subc.collectionID + '/submit_ajax', {
									"sketchIDs": [sketch.visualID]
								})
								.done(function (response) {
									d3.select(self).selectAll('li.loading').classed('loaded', true);
									window.setTimeout(function () {
										$('#addToClassModal').modal('hide');
										$('#classesDDLabel').text('Added ✓');
										$('#classesDDLabel').html('Select <span class="caret"></span>');
									}, 3000);
								});
							return false;
						});
					ccli.append('a')
						.text(ff('title'))
						.attr('href', '#')
					// ccli.append('div')
					// 	.classed('description', true)
					// 	.text(ff('description'));
					ccli.append('ul').classed('sketchList', true);
					cc.exit().remove();

					//show sketches
					d3.selectAll('#addToClassModal ul.sketchList').each(function (sc) {
						let sketches = c.sketches.filter(ff('collectionID', sc.collectionID)).slice(0, 13)
							.sort(function (a, b) {
								return a.submittedOn + a.visualID > b.submittedOn + b.visualID ? 1 : -1
							});
						OP.listSketches(this, sketches, 'col-xs-1');
					});
				});


			return false;
		})
}
var setupAddToCuration = function () {
	let curations = d3.select('#curationsDD').selectAll('li').data(sessionUser.curations);
	curations.enter()
		.append('li')
		.text(ff('title'))
		.on('click', function (c) {
			let title = $(this).text();
			$('#curationsDDLabel').text('...');

			$.post('/curation/' + c.collectionID + '/submit_ajax', {
					"sketchID": sketch.visualID
				})
				.done(function (response) {
					$('#curationsDDLabel').text('Added ✓');
					window.setTimeout(function () {
						$('#curationsDDLabel').html('Select <span class="caret"></span>');
					}, 3000);
				});


			return false;
		})
}

var setupHearts = function () {
	//d3.select('#heartsList')
	OP.listUsers('#heartsList', sketch.hearts, 'col-xs-3', false, true);
	$('#heartsList').scroll(function () {
		$('#heartsList .userThumb:not(.noThumbnail)').unveil(100, function (img) {
			$(this).load(function () {
				if ($(this).attr('src') == '/assets/img/blank.png') {
					$(this).addClass('noThumbnail');
				}
				$(this).removeClass('hideUntilLoaded');
			});
		});
	});
	$('#heartsList .userLi:nth-of-type(4n)').addClass('lastOfRow');
}
//checks if user already hearted the sketch already. toggles the heart accordingly.
var checkHeart = function () {
	var heartedUsers = sketch.hearts.filter(function (d) {
		return +d.userID == sessionUser.userID
	});
	if (heartedUsers.length > 0) {
		$('#sideControls .icon_heart').addClass('selected');
		$('#sideControls .icon_arrowToHeart').addClass('shoot');
	}

}
var toggleHeart = function (forceHeart) {
	var heartSketch;
	var icon = $('#sideControls .icon_heart');
	var val;
	if (!icon.hasClass('selected')) { //heart the sketch
		icon.addClass('selected');
		$('#sideControls .icon_arrowToHeart').addClass('shoot');
		val = icon.siblings('.metric').text();
		val = (+val > 0) ? +val + 1 : 1;
		icon.siblings('.metric').text(val);
		heartSketch = true;
	} else {
		icon.removeClass('selected');
		$('#sideControls .icon_arrowToHeart').removeClass('shoot');
		val = icon.siblings('.metric').text();
		val = (+val > -1) ? +val - 1 : 0;
		icon.siblings('.metric').text(val);
		heartSketch = false;
	}
	return heartSketch;
}

//Parent Function: toggles the heart, runs ajax, and undos if ajax fails
var heartSketch = function (forceHeart) {
	if (+sessionUser.userID === 0) {
		// window.location.href = '/home/signin?prevUrl=/sketch/' + sketch.visualID;
		OP.showJoinModal(function () {
			heartSketch(true);
		});
	} else {
		let heartSketch;
		if (forceHeart === true) {
			heartSketch = true;
			heartSketch = toggleHeart(true);
		} else {
			heartSketch = toggleHeart();
		}

		//do ajax call
		$.getJSON('/sketch/' + sketch.visualID + '/heart/' + heartSketch)
			.done(function (response) {
				//heart is already toggled, don't do anything.
			})
			.fail(
				function (response) {
					var message = response.responseJSON ? response.responseJSON.message : response.statusText;
					OP.showMessageModal(message);
					toggleHeart(); //revert back the heart
				})
			.always(function (response) {

			});
	}
}

//checks if sketchChanged and if so, presents the proper button
var wannaSave = function (forceChange) {
	if (typeof forceChange != 'undefined' && forceChange === true) {
		sketchChanged = true;
	}
	wannaLeave(sketchChanged); //enabled "are you sure you want to leave?" dialog

	if (sketchChanged) {
		resetSaveButtons();
		$('#shareButtons').addClass('flip');
		$('#sideButtons').removeClass('flip');
	}

	//if owner, show save button if code changed
	if (sketch.userID == sessionUser.userID) {
		if (sketchChanged) {
			//$('#sideControls').hide();
			$('#saveSketchButton').button('save').show();
			$('#forkSketchButton').show();
			$('#codeVersions ul').addClass('hasTempVersion');
			$('#sideButtons').addClass('show');

		} else {
			$('#sideButtons').removeClass('show');
			$('#shareButtons').addClass('flip');
			$('#codeVersions ul').removeClass('hasTempVersion');
		}
	} else { //if guest
		if (sketchChanged) {
			//$('#sideControls').hide();
			$('#sideButtons').addClass('show forkOnly');
		} else {
			$('#sideButtons').removeClass('show');
			$('#shareButtons').addClass('flip');
		}
	}

}

var wannaSaveReset = function () {
	sketchChanged = codeChanged = false;
	resetSaveButtons();
	wannaSave();
}
var wannaLeaveReset = function () {
	wannaLeave(false);
}
var wannaLeave = function (bool) {
	if (bool === true) {
		$(window).on("beforeunload", function (e) {
			var confirmationMessage = "You made changes on sketch, but didn't save yet.";

			(e || window.event).returnValue = confirmationMessage; //Gecko + IE
			return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
		});
	} else {
		$(window).off("beforeunload");
	}
}
/*
changeModeToPjs: used when warning user in console that the sketch seems pjs sketch instead
of p5js.
*/
var changeModeToPjs = function () {
	$('#sketchModeOption1').click();
	sketchConsole.clear();
	sketchConsole.show(false);
	$('.navbar .icon_play').click();
}

var toggleFullscreen = function () {
	$('body').toggleClass('fullscreen');
	sketchEngine.restartSketch(null, true);
	return $('body').hasClass('fullscreen');
}
var isFullscreen = function () {
	return $('body').hasClass('fullscreen');
}
