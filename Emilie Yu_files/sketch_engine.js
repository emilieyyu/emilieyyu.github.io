var sketchWindow, processor, showFrameRate = false,
    sketchPlaying = false;


var sketchEngine = function () {

}
sketchEngine.setupPjs = function (code, giveFocus) {
	sketchEngine.setupLoopProtection();
	if(sketch.loopProtect){ code = loopProtect(code)};
	
	//create iframe
    var iframe = document.createElement('iframe');
    $(iframe).addClass('inactive');
    var head = '<head><title>Sketch Iframe</title><base href="'+ sketch.fileBase + '"><link><link rel="stylesheet" href="' + sketch.libraryBase + '/assets/css/sketch/sketchIframe.css"></head>';
    var body = '<body><canvas id="pjs"></canvas></body>';
    var jquery = '<script language="javascript" type="text/javascript" src="' + sketch.libraryBase + '/assets/js/vendor/jquery-1.11.1.min.js"></script>';
    var pjs = '<script language="javascript" type="text/javascript" src="' + sketch.engineUrl + '"></script>';
    var attrchange = '<script language="javascript" type="text/javascript" src="' + sketch.libraryBase + '/assets/js/vendor/attrchange.js"></script>';
    var libraries = sketchEngine.getLibraries();
    var mousetrap = '<script src="' + sketch.libraryBase + '/assets/js/vendor/mousetrap-master/mousetrap.min.js"></script>';
    var allExtension = '<script language="javascript" type="text/javascript" src="' + sketch.libraryBase + '/assets/js/sketch/all_OPextension.js"></script>';
    var giveFocusScript = giveFocus? '<script language="javascript" type="text/javascript" src="' + sketch.libraryBase + '/assets/js/sketch/iframe_giveFocus.js"></script>':'';
    var extension = '<script language="javascript" type="text/javascript" src="' + sketch.libraryBase + '/assets/js/sketch/pjs_OPextension.js"></script>';
    //        var script = '<script type="application/processing" data-processing-target="pjs">'+code+'</script>';
    var script = '<script id="pjsCode" type="application/processing">' + code + '</script>';
    var html = '<html>' + head + body + jquery + mousetrap + pjs + libraries + attrchange + giveFocusScript + allExtension + extension + script + '</html>';

    $('#sketch').html('');
    $('#sketch').get()[0].appendChild(iframe);
    sketchWindow = iframe.contentWindow;

    sketchWindow.document.open();
    sketchWindow.document.write(html);
    sketchWindow.document.close();
    //prevent bounce on touch devices
    sketchWindow.document.ontouchmove = function(event){
        event.preventDefault();
    }
    processor = sketchWindow.processor;
    sketchEngine.sketchReady();
    if (showFrameRate) {
        window.setInterval(function () {
            if (processor && showFrameRate) {
                $('#frameRate').html('fr: ' + Math.round(processor.__frameRate));
            }
        }, 1000);
    }
}
sketchEngine.setupP5js = function (code, giveFocus) {
    $('#sketch').remove('iframe').html('');
    //create iframe
    var iframe = document.createElement('iframe');
	$(iframe).addClass('inactive');
	sketchEngine.setupLoopProtection();
	if (sketch.loopProtect) {
		code = loopProtect(code)
	};

    var body = '<body><input id="iosKeyboardInput" type="text"></input></body>';
    var head = '<head><title>Sketch Iframe</title><base href="' + sketch.fileBase + '"><link rel="stylesheet" href="' + sketch.libraryBase + '/assets/css/sketch/sketchIframe.css"></head>';

    var jquery = '<script language="javascript" type="text/javascript" src="' + sketch.libraryBase + '/assets/js/vendor/jquery-1.11.1.min.js"></script>';
    var mousetrap = '<script src="' + sketch.libraryBase + '/assets/js/vendor/mousetrap-master/mousetrap.min.js"></script>';
    var p5js = '<script language="javascript" type="text/javascript" src="' + sketch.engineUrl + '"></script>';
    var libraries = sketchEngine.getLibraries();
    var allExtension = '<script language="javascript" type="text/javascript" src="' + sketch.libraryBase + '/assets/js/sketch/all_OPextension.js"></script>';
    var giveFocusScript = giveFocus? '<script language="javascript" type="text/javascript" src="' + sketch.libraryBase + '/assets/js/sketch/iframe_giveFocus.js"></script>':'';
    var extension = '<script language="javascript" type="text/javascript" src="' + sketch.libraryBase + '/assets/js/sketch/p5js_OPextension.js"></script>';
    var script = '<script>' + code + '</script>';
    //var script = '<script>try{' + code + '} catch(e){ parent.p5jsError(e); throw new error(e);}</script>';
    var html = '<html>' + head + jquery + mousetrap + body + p5js + libraries + allExtension + giveFocusScript + extension + script + '</html>';

    $('#sketch').get()[0].appendChild(iframe);

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(html);
    iframe.contentWindow.document.close();

    //prevent bounce on touch devices
    iframe.contentWindow.document.ontouchmove = function(event){
        event.preventDefault();
    }


    sketchWindow = iframe.contentWindow;

    processor = sketchWindow;
    sketchEngine.sketchReady();
//    window.setInterval(function () {
//        //$('#frameRate').html('fr: ' + Math.round(processor.frameRate()));
//    }, 1000);
	


}


sketchEngine.setSketchDimensions = function (w, h) {
	//console.info('set dimensions: ',w,h);
	
    $('iframe').css('width', w); //don't add padding otherwise #sketch has scrollbars.
    $('iframe').css('height', h);
    if($('#embedText').length !== 0){
        var embed = $('#embedText').html();
        embed = embed.replace(/(width\s*=\s*["'])[0-9]+(["'])/ig, function($0,$1,$2){ return $1 + w + $2});
        embed = embed.replace(/(height\s*=\s*["'])[0-9]+(["'])/ig, function($0,$1,$2){ return $1 + h + $2});
        $('#embedText').html(embed);
	}
	
	//rescale if too big, particularly for mobile
	if ($(window).outerWidth() < 768 && w>=768){
		let scaleRatio = $(window).outerWidth()/w;
		$('iframe').css({
			'max-width':'none',
			'transform': 'translateY(-50%) scale(' + scaleRatio + ')',
			'transform-origin': 'center left'
		});

	}


    return true;
}
sketchEngine.setSketchBackground = function (colorCss) {
    $('#sketch').css('background-color', colorCss);
}
sketchEngine.getSketchFullScreenDimensions = function () {
    return [$(window).width(), $(window).height()];
}

sketchEngine.pauseSketch = function (bool) {
    try {
        if (typeof bool != 'undefined' && bool === true) {
            processor.noLoop();
            //$('#mainControls .icon_play').removeClass('icon_pause');
            $('#mainControls .icon_play').removeClass('icon_restart');
			sketchPlaying = false;
		} else if (typeof bool != 'undefined' && bool===false) {
			processor.loop();
            $('#mainControls .icon_play').addClass('icon_restart');
			sketchPlaying = true;
        }else { //toggle pause
			sketchPlaying ? processor.noLoop() : processor.loop();
			sketchPlaying = !sketchPlaying;
			d3.select('#mainControls .icon_play').classed('icon_restart', sketchPlaying);
		}

		//reset the whole sketch if sounds library or dom library is loaded?
		if (typeof processor.getAudioContext !== 'undefined' && sketchPlaying == false) {
			processor.getAudioContext().close();
		}

    } catch (e) {

    }
}
sketchEngine.restartSketch = function (code, giveFocus) {
	sketchEngine.runSketch(code, giveFocus);
}
sketchEngine.sketchReady = function () {
    window.setTimeout(function(){
        $('#sketch iframe').removeClass('inactive');
    }, 400);
}


sketchEngine.runSketch = function (code, giveFocus) {
    if(typeof codeEditor != 'undefined'){
      codeEditor.save();
	}
	$('#sketch').css('background-color', 'transparent'); //remove sketch bg

    //run sketch
    if (typeof code == 'undefined' || code == null) {
        code = '';
        //var lineNumber = 0;
        $('#codePanel textarea.code').each(function (d) {
            var c = $(this).val();
            //var lineNumber= c.split("\n");
            //var lineNumberTrace = '//OpenProcessingLineNumberTrace:'+lineNumber
            code += "\n" + c;
        });
	}
    if (sketch.isPjs == "1") {
        sketchEngine.setupPjs(code, giveFocus);

    } else if (sketch.isPjs == "2") {
        sketchEngine.setupP5js(code, giveFocus);
    }

    //check if wrong type is used
    if(code.indexOf("void setup") !== -1 && sketch.isPjs == "2" && sessionUser.userID == sketch.userID){
        sketchConsole.showMessage('Your sketch mode is set as P5js, but it seems to be a Processing.js sketch (has "void setup()").<br/> Change sketch mode to Processing.js? <a href="#" onclick="changeModeToPjs()">Yes, change it to Processing.js</a>');
    };


}
sketchEngine.getLibraries = function () {
    var scripts = '';
    if (typeof libraries != 'undefined') {
        var libs = libraries.filter(function (l) {
            return l.enabled == true && (l.title != 'p5js' && l.title != 'pjs');
        });
        libs.forEach(function (l) {
            scripts += "<script src='" + l.url + "'></script>"
        });

    }
    return scripts;
}

sketchEngine.slowdownSketch = function (bool) {
    try {
        if (bool) {
            processor.frameRate(15);
        } else {
            processor.frameRate(60);
        }
    } catch (e) {}
}

sketchEngine.setupLoopProtection = function () {
	sketch.loopProtect = sketch.createdOn > "2018-10-08";
	window.loopProtect.hit = function (b) {
		//OP updates
		var c = 'Exiting potential infinite loop. To disable loop protection, add "//noprotect" to the end of the line.';
		let err = new Error(c, '', b);
		window.sketchConsole.showError(c, 'null', b, 0, err);
		
	}
}

