
var createTempVersion = function () {
	let tempVersion = jQuery.extend(true,{}, sketch.versions[0]);
	tempVersion.versionID = -1;
	tempVersion.tempVersion = true;
	tempVersion.isRestore = 0;
	tempVersion.diffLine = '';
	tempVersion.updatedOn = tempVersion.createdOn =  new Date();
	tempVersion.codeObjects.forEach(function(c,i){ c.visualCodeID = 'tempCode' + i });
	sketch.currentVersion=tempVersion;
	
	if (!sketch.newSketch) { //add to the top of the version array
		sketch.versions.unshift(tempVersion);
	}else{ //replace the back-end one in versions
		sketch.versions[0] = tempVersion;
	}
}
var selectVersion = function (versionID) {

	if (typeof versionID == 'undefined') {
		if (sketch.newSketch) {
			//select initial version default
			sketch.currentVersion = sketch.versions[0];
		} else {
			sketch.currentVersion = sketch.versions[0];
		}
	}
}

var previewVersion = function (version) {
	//save any existing selected tab, to select again after version update
	let selectedTabTitle = d3.select('#codeTabs .selected').datum().title;

	if (version == false){ //reset preview
		selectVersion();
		setupCode();
		d3.selectAll('.codePane textarea').each(function (code) {
			if(code){
				code.editor.setOption('readOnly', false);
				code.editor.setOption('cursorBlinkRate', 530);
				//code.editor.refresh();
			}
		})
		////clear active version in the list 
		d3.selectAll('#codeVersions li.active').classed('active', false);
		d3.selectAll('#codeVersions .btn').remove();

	} else if (sketch.currentVersion != version){
		sketch.currentVersion = version;
		sketch.currentVersion.codeObjects = sketch.currentVersion.codeObjects;
		setupCode();
		d3.selectAll('.codePane textarea').each(function(code){
			if(code){
				code.editor.setOption('readOnly',true);	
				code.editor.setOption('cursorBlinkRate', -1);
				//code.editor.refresh();	
			}
		})
	}
	checkIfTabsNeeded(); //show tabs if are needed
	//select the same tab if exists
	let tabToSelect = d3.selectAll('#codeTabs li').filter(ff('title',selectedTabTitle));
	$(tabToSelect.node()).click();
}


var setupVersions = function () {
	
	if(!owner && !sessionUser.isProfessorOf){
		$('#codeVersionsLink').parent().remove();
		$('#codeVersions').remove();
		return false;
	}
	

	//prepare diff lines to indicate number of changes
	if (!sketchChanged) { //when sketch first loaded
		sketch.versions.forEach(function (currentVersion, i) {
			if (i < sketch.versions.length - 1) { //don't do it for the last one (initial version)
				const priorVersion = sketch.versions[i + 1];
				calculateDiff(currentVersion, priorVersion);
			}
		});
	} else { //at this point, all diff lines must have been calculated. Do it only between New Version and prior
		if (sketch.versions.length > 1) {
			calculateDiff(sketch.versions[0], sketch.versions[1]);

		}
	}

	d3.select('#codeVersions').classed('professorMode',sessionUser.isProfessorOf);

	var lisData = d3.select('#codeVersions ul').selectAll('li').data(sketch.versions, ff('versionID'));
	var lisEnter = lisData.enter().append('li');
	lisEnter
		.classed('tempVersion', function (v) { return v.tempVersion })
	lisEnter.append('a')
		.attr('href', '#')
		.classed('versionDate', true)
		.on('click', function (d, i) {
			d3.selectAll('#codeVersions li.active').classed('active', false);
			d3.selectAll('#codeVersions .btn').remove();
			d3.select(this.parentNode)
				.classed('active', true)
				.append('button')
				.classed('btn btn-primary', true)
				.attr('data-loading-text', 'Restoring...')
				.text(function () {
					return i == 0 ? 'Save' : 'Restore';
				})
				.on('click', function (v) {
					if (i == 0) { //trying to restore to the most recent version, which is basically a page refresh
						$("input[name='restoredVersion']").val(false);
					} else {
						$("input[name='restoredVersion']").val(true);
					}
					quickSave();
					previewVersion(false); //reset the selected version to the default (new) one 

				})
			d3.select(this.parentNode)
				.append('button')
				.classed('btn btn-default white', true)
				.text('Cancel')
				.on('click', function () {
					previewVersion(false);
					d3.selectAll('#codeVersions li.active').classed('active', false);
					d3.selectAll('#codeVersions .btn').remove();
				})
			previewVersion(d);
			return false;
		})
	lisEnter.append('div').classed('versionTimestamp', true)
		.text(function (d) {
			return moment(d.updatedOn).local().format('MMMM Do YYYY, h:mma');
		});

	lisEnter.append('div').classed('versionDescription', true)
		.text('Initial version');


	//update timestamp
	d3.selectAll('#codeVersions li').select('a').text(function (d) {
		return d.tempVersion ? 'New version (not saved yet)' : moment(d.updatedOn).fromNow();
	})
	d3.selectAll('#codeVersions li').select('.versionDescription').text(function (d) {
		return d.diffLine ? d.diffLine : 'Initial version';
	})

	//for each version, calculate diff and print out the number of changes
	d3.selectAll('#codeVersions li:not(.tempVersion)')
		.sort(function (a, b) { return a.versionID > b.versionID ? -1 : 1 })


}

//calculate diff of two versions, and add the related line to version.diffLine
var calculateDiff = function (currentVersion, priorVersion) {
	let added = 0;
	let removed = 0;
	currentVersion.codeObjects.forEach(function (c) { //for each code object
		let priorCodeObject = priorVersion.codeObjects.filter(function (c2) {
			return c2.title == c.title
		});
		let diff;
		if (priorCodeObject.length > 0) {
			diff = JsDiff.diffTrimmedLines(priorCodeObject[0].code.trim(), c.code.trim());
		} else {
			diff = JsDiff.diffTrimmedLines('', c.code.trim()); //if code is not found on the other, compare the lines to empty code
		}

		added += d3.sum(diff.filter(function (d) { return d.added }), ff('count'));
		removed += d3.sum(diff.filter(function (d) { return d.removed }), ff('count'));
		//clog(currentVersion.versionID, priorVersion.versionID, diff);
	});
	//TODO: also, if tabs are removed in the new version, those will be skipped above since they no longer exist in currentVersion. 
	//gotta check any tab in the prior version that is not in the new, and add them to total below.
	let total = added + removed;
	return currentVersion.diffLine = total + ' line' + (total != 1 ? 's' : '') + (+currentVersion.isRestore ? ' restored' : ' changed');
}
