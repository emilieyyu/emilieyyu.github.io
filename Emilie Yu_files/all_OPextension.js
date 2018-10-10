window.onerror = window.parent.sketchConsole.showError;
window.loopProtect = window.parent.loopProtect;

$(window).on('load', function () {
	setupKeys();
});

let giveSketchFocus = function () { //this is run by iframe_giveFocus.js. That js loaded if runSketch(..,true) is called.
	if(!window.parent.embedPage){
		if ($('canvas').length > 0) {
			$('canvas').prop('tabindex', 0).focus();
		} else {
			$('body').prop('tabindex', 0).focus();
		}
	}
}

var setupKeys = function () {
	//fullscreen
	Mousetrap.bind('ctrl+alt+f', function (e) {
		e.preventDefault();
		let isFull = window.parent.toggleFullscreen();
		return false;
	});
	//exit fullscreen
	Mousetrap.bind('escape', function (e) {
		if (window.parent.isFullscreen()) {
			e.preventDefault();
			window.parent.toggleFullscreen();
			return false;
		}
	});
	/*
	//info
	Mousetrap.bind('ctrl+z', function (e) {
	  e.preventDefault();
	  console.log($(window.parent.document).find('#mainControls .icon_info'));
	  $(window.parent.document).find('#mainControls .icon_info').click();
	  return false;
	});
	//play
	Mousetrap.bind('ctrl+x', function (e) {
	    e.preventDefault();
	    $(window.parent.document).find('#mainControls .icon_play').click();
	    return false;
	});
	//code
	Mousetrap.bind('ctrl+c', function (e) {
	    e.preventDefault();
	    $(window.parent.document).find('#mainControls .icon_code').click();
	    return false;
	});
	*/
}