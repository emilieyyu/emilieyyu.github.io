var sketchConsole = function () {

}

sketchConsole.setMode = function (mode) {
    sketchConsole.consoleMode = mode;  //auto or auto
    d3.select('#console').classed('auto',mode == 'auto');
}
sketchConsole.init = function (mode) {
    sketchConsole.autoScroll = true;
    $('#console .icon_close').off();
    $('#console .icon_close').on('click', function () {
        sketchConsole.setMode('minimized');
        sketchConsole.show(false);
    });
    $('#console .consolePin').off();
    $('#console .consolePin').on('click', function () {
        sketchConsole.setMode('auto');
        sketchConsole.show(true);
    });
    $('#console').off('mousewheel');
    $('#console').on('mousewheel', function () {
        sketchConsole.autoScroll = false;
    });
    $('#console').off('mouseleave');
    $('#console').on('mouseleave', function () {
        sketchConsole.autoScroll = true;
    });
    sketchConsole.setMode(mode);
    sketchConsole.hasMessage(false); //reset behavior
}

//assign error handling functions to the given iframe
sketchConsole.setError = function (iframe) {

    iframe.contentWindow.onerror = sketchConsole.showError;
    window.onerror = sketchConsole.showError;
}
sketchConsole.clear = function () {
    $('#consoleContent').html('');
    sketchConsole.hasMessage(false);
    d3.select('#codePanel').classed('withConsole', false);
}

sketchConsole.show = function (bool) {
    d3.select('#console').classed('auto', bool);
    d3.select('#codePanel').classed('withConsole', bool);
}


sketchConsole.showError = function (message, url, lineNumber, column, errorObj) {
	
    //console.log('error data:', message, url, lineNumber, column, errorObj);
    var brokenSketch = false;
    if (+sketch.mode == 2) { //get line number, only for p5js

        //in script, all tab codes are stacked, so find the actual line number, and the tab it relates to
        lineNumber--; //remove the first line (<script>);
        var found = false;
        var lineNumberTrace = 0;
        var i = -1;
        brokenSketch = null;
        var realLineNumber = lineNumber - 1; //the one without the offset
        sketch.currentVersion.codeObjects.forEach(function (c) {
            var len = c.editor.doc.lineCount();
            lineNumberTrace += len;
            if (lineNumber <= lineNumberTrace && brokenSketch === null) {
                brokenSketch = c;
                lineNumber -= lineNumberTrace - len;
            }
        })
    } else {
        lineNumber = 0;
    }
    //i will indicate the right code tab
    var tabName = brokenSketch ? brokenSketch.title : '';

    var msg = (errorObj && errorObj.message) ? errorObj.message : message;
    lineNumber = 'Line ' + lineNumber + ': ';

    var messageDiv;
    if (+sketch.mode == 2) {
        messageDiv = $('<pre class="error" title="' + url + '">' + tabName + ', ' + lineNumber + msg + '</pre>');
    } else {
        messageDiv = $('<pre class="error" title="' + url + '">' + msg + '</pre>');
    }
    $('#consoleContent').append(messageDiv);

    if (sketchConsole.autoScroll && $('#consoleContent').length !== 0) {
        $('#consoleContent').scrollTop($('#consoleContent')[0].scrollHeight)
    }
    sketchConsole.hasMessage(true);
    sketchConsole.show(true); //should it popup only if it is the owner?
};
sketchConsole.showMessage = function (msg, noLineBreak) {
    //var msg = JSON.stringify(arguments);
    var messageDiv = $('<pre>' + msg + '</pre>');
    if (noLineBreak == true) {
        messageDiv.addClass('noLineBreak');
    }
    $('#consoleContent').append(messageDiv);

    if (sketchConsole.autoScroll && $('#consoleContent').length !== 0) {
        $('#consoleContent').scrollTop($('#consoleContent')[0].scrollHeight)
    }
    sketchConsole.hasMessage(true);
};
sketchConsole.hasMessage = function(bool){
    d3.select('#console').classed('hasMessage',bool);
    //$('#console .consolePin').removeClass('fx-stream show');
    var pin = $('#console .consolePin');
    if (!pin.hasClass('fx-stream')) {
        pin.addClass('show fx-stream');
        window.setTimeout(function () {
            pin.removeClass('fx-stream');
        }, 1000);
    }

}
sketchConsole.p5jsError = function (e) {
    sketchConsole.showError(e);
}
