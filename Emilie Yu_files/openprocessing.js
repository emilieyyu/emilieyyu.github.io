var demoMode = !(window.location.hostname.indexOf("openprocessing.org") > -1);
var mixpanel = false;
$(function () {
	moment.tz.setDefault("America/New_York"); //I don't need this if all the sql dates were passed in UTC. but php is in New York,so I set db to New York as well. To show dates on user's local, I have to use moment(nyTimestamp).local();
	//load fonts
	//loadFonts();

	loadNavigation();
	loadSearch();

	OP.setupMembershipElements();
	OP.setupImageLoading();
	if (backendMessage.length > 0 && backendMessage !== ' _show_signin_message_') {
		//if message is _show_signin_message_, page title is changed instead of popup.
		OP.showMessageModal(backendMessage);
	}

	//profiler
	$('#codeigniter_profiler').on('click', function () {
		$(this).toggle();
	});

	//remove any whitespace after/before to prevent html whitespaces
	$('.editable').each(function () {
		$(this).html(($(this).html().trim()));
	});
	loadIntercom();
	$('[data-toggle="tooltip"]').tooltip(); //enable tooltips

	if(demoMode){
		///for demo purposes
		//$('.navbar').addClass('expanded');
		//$('.navbar').off('mouseleave')
		//$('.navbar .OPlogo').trigger('mouseover');
		//showNavigation('.opNavigation');
	}

});

var loadIntercom = function (guest) {
	let APP_ID = "z5peuw78"
	if ((typeof sessionUser != 'undefined' && sessionUser.intercomHash)) {
		window.intercomSettings = {
			app_id: APP_ID,
			custom_launcher_selector: '.intercomLink',
			user_hash: sessionUser.intercomHash,
			name: sessionUser.fullname, // Full name
			membershipType: sessionUser.membershipType > 0 ? sessionUser.membershipType : 0,
			memberSince2: sessionUser.memberSince2 ? sessionUser.memberSince2 : null,
			lastLogin_at: sessionUser.lastLogin, 
			email: sessionUser.email, // Email address
			user_id: sessionUser.userID, // current_user_id
			userType: sessionUser.userType // userType
		};
	}
	else if (guest) {
		window.intercomSettings = {
			app_id: APP_ID,
			custom_launcher_selector: '.intercomLink'
		};
	}
	if(window.intercomSettings){
		(function () {
			var w = window;
			var ic = w.Intercom;
			if (typeof ic === "function") {
				ic('reattach_activator');
				ic('update', intercomSettings);
			} else {
				var d = document;
				var i = function () {
					i.c(arguments)
				};
				i.q = [];
				i.c = function (args) {
					i.q.push(args)
				};
				w.Intercom = i;

				function l() {
					var s = d.createElement('script');
					s.type = 'text/javascript';
					s.async = true;
					s.src = 'https://widget.intercom.io/widget/' + APP_ID;
					var x = d.getElementsByTagName('script')[0];
					x.parentNode.insertBefore(s, x);
				}
				if (w.attachEvent) {
					w.attachEvent('onload', l);
				} else {
					w.addEventListener('load', l, false);
				}
			}
		})()
	}
	
}

var loadNavigation = function () {

	//prepare navigation
	if ($('html').hasClass('touch')) {
		$('.navbar .OPlogo')
			.on('click', function () {
				clog($('.navbar').hasClass('expanded'));
				$('.navbar').toggleClass('expanded');
				//showNavigation($(this).attr('data-target'));
				return false;
			})
		$('.navbar .icon_close')
			.on('click', function () {
				$('.navbar').removeClass('expanded');
				//$('.navbar .navigationContent, .navbar .icon').removeClass('active');
				return false;
			})


	} else {
		$('.navbar .OPlogo').on('mouseenter', function () {
			$('.navbar').addClass('expanded');
			showNavigation($(this).attr('data-target'));
		});


		$('.navbar .OPlogo').on('mouseover', function () {
			showNavigation($(this).attr('data-target'));
		});
		$('.navbar').on('mouseleave', function () {
			$('.navbar').removeClass('expanded');
			$('.navbar .navigationContent, .navbar .icon').removeClass('active');
		});


	}
	$('.navbar .icon_search').click(function () {
		$('.navbar .searchForm input').focus();
	});



}
var loadSearch = function () {
	var search = $('.searchForm input');
	search.on('focus', function () {
			$(this).addClass('filled');
		})
		.on('blur', function () {
			if ($(this).val() != '') {
				$(this).addClass('filled');
			} else {
				$(this).removeClass('filled');
			}
		});

	//set tag behavior
	var tags = $('.searchForm .tags a');
	tags.on('click', function (e) {
		e.preventDefault();
		$('.navbar .searchForm input[name="time"]').val($(this).attr('data-time'));
		$('.navbar .searchForm input[name="type"]').val($(this).attr('data-type'));
		$('.navbar .searchForm input[name="q"]').val($(this).attr('data-q'));
		$('.navbar .searchForm form').submit();
		return false;
	});

}


var showNavigation = function (target) {
	$('.navbar').addClass('expanded');
	$('.navbar .navigationContent, .navbar .icon').removeClass('active');
	if (target == '.userNavigation') {
		$('.navbar .userNavigation').addClass('active');

		//populate sketches
		if ($('.userNavigation .sketches').text().trim().length === 0) { //if already not populated
			$.getJSON('/api/user/' + user.userID + '/true.json', function (data) {
				var sketches = data.visuals;

				//create images
				var sketchImages = d3.select('.userNavigation .sketches').selectAll('.sketch')
					.data(sketches);
				sketchImages.enter()
					.append('img')
					.attr('src', function (s) {
						return '/sketch/' + s.id + '/thumbnail'
					})
					.on('click', function (s) {
						window.location.href = '/sketch/' + s.visualID;
					})
					.classed('selected', function (s) {
						return sketch.visualID == s.visualID
					})
					.classed('sketch', true);

				var cOffset = 0;

				//enable arrows
				var enableArrows = function () {
					var sketches = d3.select('.navbar .sketches');
					var sketchNavigation = d3.select('.navbar .sketchNavigation');
					var w1 = $(sketchNavigation[0]).width();
					var w2 = $(sketches[0]).width();
					d3.select('.userNavigation .icon_arrow_left')
						.classed('hide', cOffset === 0);
					d3.select('.userNavigation .icon_arrow_right')
						.classed('hide', -cOffset >= w2 - w1);
				}
				enableArrows();
				//add arrows if necessary
				d3.select('.userNavigation .icon_arrow_right')
					.on('click', function () {
						var sketches = d3.select('.navbar .sketches');
						var sketchNavigation = d3.select('.navbar .sketchNavigation');
						var w1 = $(sketchNavigation[0]).width();
						var w2 = $(sketches[0]).width();
						var offset = Math.min(w1, w2 - w1 + cOffset);
						cOffset -= offset;
						$('.navbar .sketch').css('transform', 'translateX(' + cOffset + 'px)');
						enableArrows();
					});
				d3.select('.userNavigation .icon_arrow_left')
					.on('click', function () {
						var sketches = d3.select('.navbar .sketches');
						var sketchNavigation = d3.select('.navbar .sketchNavigation');
						var w1 = $(sketchNavigation[0]).width();
						var w2 = $(sketches[0]).width();
						var offset = Math.min(w1, -cOffset);
						cOffset += offset;
						$('.navbar .sketch').css('transform', 'translateX(' + cOffset + 'px)');
						enableArrows();

					});
			});
		}
	}
	if (target == '.searchNavigation') {
		$('.navbar .searchNavigation').addClass('active');
		$('.navbar .icon_search').addClass('active');

	}
	if (target == '.opNavigation') {
		$('.navbar .opNavigation').addClass('active');
		$('.navbar .OPlogo').addClass('active');

	}

}

var loadFonts = function () {
	/*//loads typekit fonts
	var config = {
	        kitId: 'zbx3pfn',
	        scriptTimeout: 3000,
	        async: true
	    },
	    h = document.documentElement,
	    t = window.setTimeout(function () {
	        h.className = h.className.replace(/\bwf-loading\b/g, "") + " wf-inactive";
	    }, config.scriptTimeout),
	    tk = document.createElement("script"),
	    f = false,
	    s = document.getElementsByTagName("script")[0],
	    a;
	h.className += " wf-loading";
	tk.src = 'https://use.typekit.net/' + config.kitId + '.js';
	tk.async = true;
	tk.onload = tk.onreadystatechange = function () {
	    a = this.readyState;
	    if (f || a && a != "complete" && a != "loaded") return;
	    f = true;
	    window.clearTimeout(t);
	    try {
	        Typekit.load(config)
	    } catch (e) {}
	};
	s.parentNode.insertBefore(tk, s)*/
}

var loadLiveReload = function () {
	$('body').append('<script src="https://livereload.localhost:8890/livereload.js?snipver=1"></' + 'script>');

}

function OP() {
	//clog: shorter version of clog. Turned off on isProd() = false;
	window.clog = (isProd()) ? function () {} : console.log.bind(console);
}
OP();


OP.check_charcount = function (dom, max, e) {

	if (e.which != 8 && $(dom).text().length > max) {
		e.preventDefault();
	}
}

OP.dateSQL = function () {
	var date = new Date();
	date = date.getUTCFullYear() + '-' +
		('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
		('00' + date.getUTCDate()).slice(-2) + ' ' +
		('00' + date.getUTCHours()).slice(-2) + ':' +
		('00' + date.getUTCMinutes()).slice(-2) + ':' +
		('00' + date.getUTCSeconds()).slice(-2);
	return date;

}

/** adds hideUntilLoaded class to given images, and removes that class when image is loaded
 **/
OP.setupImageLoading = function (selector) {
	if (typeof selector == 'undefined') {
		selector = '.sketchThumb:not(.noUnveil):not(.noThumbnail), .userThumb:not(.noUnveil):not(.noThumbnail)';
	}
	let elements = $(selector);
	elements.addClass('hideUntilLoaded');

	//set unveil
	if (elements.length > 0) {
		elements.unveil(100, function (img) {
			$(this).load(function () {
				$(this).removeClass('hideUntilLoaded');
				if ($(this).attr('src') == '/assets/img/blank.png') {
					$(this).addClass('noThumbnail');
				}
			});
		});
		$(window).resize();
	}

	//set imagesLoaded
	/*if ($(selector).length > 0) {
	    $(selector).imagesLoaded()
	        .progress(function (imgLoad, image) {
	            $(image.img).removeClass('hideUntilLoaded');
	        })
	        .error(function () {
	            $(this).attr('src', '/assets/img/blank.png');
	        });
	}*/

}

/** listSketches adds the given sketches in data in a list format. selector should be UL (unordered list);
 **/
OP.listSketches = function (selector, data, classes) {
	d3.select(selector).classed('sketchList', true);

	var sketches = d3.select(selector).selectAll('li.sketchLi')
		.data(data, function (d) {
			return +d.visualID
		});
	var sketchesContainer = sketches
		.enter()
		.append('li')
		.attr('class', classes)
		.classed('sketchLi', true)
		.append('a')
		.classed('sketchThumbContainer', true)
		.classed('archived', function (d) {
			d.isArchived = d.isPjs == 0;
			return +d.isArchived
		})
		.attr('href', function (d) {
			return '/sketch/' + d.visualID;
		});
	sketchesContainer
		.append('img')
		.attr('src', function (d) {
			return '/assets/img/blank.png'
			//return '/sketch/' + d.visualID + '/thumbnail'
		})
		.attr('data-src', function (d) {
			return 'https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail' + d.visualID + (d.visualID > 385700 ? '@2x.jpg' : '.jpg');
		})
		.attr('class', 'sketchThumb');
	sketchesContainer
		.append('img')
		.attr('src', function (d) {
			return "/assets/img/blank.png"
		})
		.attr('class', 'ratioKeeper');

	//draw meta data container
	sketchesContainer
		.append('div')
		.text(function (d) {
			var attrText = [];
			if (+d.isDraft) attrText.push('Draft');
			if (+d.isArchived) attrText.push('Archived');
			if (+d.isPrivate == 1) attrText.push('Private');
			if (+d.isPrivate == 2) attrText.push('Class only');
			if (+d.parentID) attrText.push('Fork');

			if (attrText.length === 0) {
				d3.select(this).remove();
			} else if (attrText.length > 1) {
				$(this).attr('title', attrText.join('/'));
				//shorten words
				attrText = $.map(attrText, function (f) {
					return f.substring(0, 2)
				});
			}
			return attrText.join('/');
		})
		.attr('class', 'attrLabel');


	let pLabel = sketchesContainer
		.append('div')
		.attr('class', 'sketchLabel')
		.append('p')
	pLabel.append('span')
		.classed('sketchTitle',true)
		.text(ff('title'));
	
	pLabel.append('span')
	.text(function(d){ return d.fullname ? 'by '+d.fullname: '';});
	
	let sketchMeta = pLabel.append('div')
		.classed('sketchMeta',true);
	sketchMeta.append('span')
		.classed('views',true)
		.text(function (d) {
			return d.numberOfViews > 0 ? d.numberOfViews : '0';
		});
	sketchMeta.append('span')
		.classed('hearts',true)
		.text(function (d) {
			return d.numberOfHearts > 0 ? d.numberOfHearts : '0';
		});
	sketchMeta.append('span')
		.classed('comments',true)
		.text(function (d) {
			return d.numberOfComments > 0 ? d.numberOfComments : '0';
		});

	

	sketches.exit().remove();


	OP.setupImageLoading($(selector).find(' .sketchThumb'));


}

OP.listUsers = function (selector, data, classes, sortFunction, loadImages) {
	d3.select(selector).classed('userList', true);
	var users = d3.select(selector).selectAll('li.userLi')
		.data(data, function (d) {
			return d.userID
		});
	var usersListItems = users
		.enter()
		.append('li')
		.attr('class', classes)
		.classed('userLi', true);
	var usersContainer = usersListItems
		.append('a')
		.classed('userThumbContainer', true)
		.attr('href', function (d) {
			return '/user/' + d.userID;
		});
	usersContainer
		.append('div')
		.text(function (d) {
			return d.fullname
		})
		.attr('class', 'userLabel')
		.each(function (d) {
			var splits = d.fullname.split(' ');
			var first = splits[0];
			var rest = '';
			var html = '<span>' + first + '</span>';
			if (splits.length > 0) {
				rest = splits.slice(1).join(' ');
				html += ' <span>' + rest + '<span>';
			}
			d3.select(this).html(html);

		});
	usersContainer
		.append('img')
		.attr('src', function (d) {
			return '/assets/img/blank.png';
		})
		.attr('data-src', function (d) {
			return "/user/" + d.userID + "/thumbnail"
		})
		.attr('class', 'userThumb');
	usersContainer
		.append('img')
		.attr('src', function (d) {
			return "/assets/img/blank.png"
		})
		.attr('class', 'ratioKeeper');
	usersContainer
		.append('div')
		.classed('userThumbPlus', function(u){ return u.membershipType>0});
	users.exit().remove();

	if (_.isFunction(sortFunction)) {
		users.sort(sortFunction);
	}
	if (typeof loadImages == 'undefined' || loadImages !== false) {
		OP.setupImageLoading(selector + ' .userThumb');
	}

}
/** setupLiveForm sets up marked items into contentEditable in-place form
   class markers = .editable,.notEditable, .removable, .selectable;
   looks for attributes:  name="tags" label="tags" description="use commas"
   **/


OP.animateTextIn = function (selector, duration, delay, animateInDelay, animateOutDelay) {
	var title = $(selector);
	if (!$('html').hasClass('wf-active')) {
		title.css('opacity', 0); //make sure to hide to text until animation starts
		window.setTimeout(function () {
			OP.animateTextIn(selector, duration, delay, animateInDelay, animateOutDelay);
		}, 200);
		return;
	}

	//prepare title
	title.addClass('animateText');
	var breakCharacter = '▒';
	var breakHTML = '<lb>' + breakCharacter + '</lb>';
	title.breakLines({
		lineBreakHtml: breakHTML
	});

	//set height to prevent jumps
	title.css({
		height: title.height() + 'px'
	});
	var titleText = title.text();

	var titleArray = titleText.split('');
	title.html(''); //clear inside
	var letters = d3.select(selector).selectAll('span').data(titleArray);
	//    var rand = Math.round(Math.random()*6+2);
	var rand = 2;
	letters
		.enter()
		.append('span')
		.html(function (d, i) {
			var ret = d === ' ' ? '&nbsp;' : d;
			//set width to 0 if this is space and next is linebreak, to prevent line drop
			if (ret === '&nbsp;' && titleArray[i + 1] === breakCharacter) {
				ret = '';
			}
			if (ret === breakCharacter) { //put a break after the span
				$('<br/>').insertAfter(this);
				return '';
			}
			return ret;

		})
		.attr('data-width', function () {
			return $(this).width()
		})
		.style('width', function () {
			return $(this).attr('data-width') + 'px'
		})
		.style('text-indent', function (d, i) {
			//negative value comes from left, positive from right;
			//return Math.random() > 1 ? 0 : -$(this).width() + 'px';
			return Math.random() > 0.5 ? $(this).width() + 'px' : -$(this).width() + 'px';
		})
		.style('opacity', 1);
	letters
		.transition()
		.duration(duration)
		.delay(function (d) {
			return Math.random() * delay + animateInDelay;
		})
		.ease('quad-in-out')
		.style('text-indent', '0px')

	if (animateOutDelay && animateOutDelay > 0) {
		window.setTimeout(function () {
			OP.animateTextOut(selector, duration, delay)
		}, animateOutDelay);
	}

	//finally reveal the title
	title.css('opacity', 1);

}
OP.animateTextOut = function (selector, duration, delay) {
	var title = $(selector);
	var letters = d3.select(selector).selectAll('span');
	var rand = Math.round(Math.random() * 6 + 2);
	letters
		.transition()
		.duration(duration)
		.delay(function (d) {
			return Math.random() * delay
		})
		.style('text-indent', function (d, i) {
			return i % rand !== 0 ? $(this).width() + 'px' : -$(this).width() + 'px';
		})
		.style('opacity', 0);

	//title.removeClass('animateText');



}


/** Hide/show related messages if user has membership **/
//The rule is that all elements show by default, and hideIf and removeIf elements are removed per session user status
OP.setupMembershipElements = function () {
	if (+sessionUser.membershipType === 2) { //if professor
		$('html').addClass('professorPlus');
		$('.removeIfProfessorPlus').remove();
	} else if ((+sessionUser.membershipType === 1 || +sessionUser.membershipType === 3)) { //plus or studentPlus
		$('html').addClass('plus');
		$('.removeIfPlus').remove();
	} else { //if nonMember
		$('html').addClass('nonMember');
		$('.removeIfProfessorPlus, .removeIfPlus').remove();
	}

	if (sessionUser.userID == 0){
		$('html').addClass('nonMember guest');
		$('.removeIfProfessorPlus, .removeIfPlus, .removeIfMember').remove();
	}

}

OP.loadGA = function () {

	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-875534-5']);
	_gaq.push(['_setDomainName', 'openprocessing.org']);
	//  <? if($googleTrackPage){ echo "_gaq.push(['_trackPageview', '$googleTrackPage']);"; }
	//	else	{ echo "_gaq.push(['_trackPageview']);"; }
	//?>
	_gaq.push(['_trackPageview']);

	(function () {
		var ga = document.createElement('script');
		ga.type = 'text/javascript';
		ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(ga, s);
	})();

}
OP.showMessageModal = function (message, onSuccess) {
	$('#messageModal').find('.message').text(message); //set message
	$('#messageModal .modal-footer button').on('click', onSuccess ? onSuccess : null); //set action
	$('#messageModal').modal('show'); //show
}

OP.setupModal = function (selector, options) {
	$modal = $(selector);
	//setup button
	$modal.find('.btn-primary')
		.off('click.modalSubmit')
		.on('click.modalSubmit', function (s) {
			var $btn = $(this).button('loading');
			if (options.ajaxURL) {
				$.ajax({
						method: 'GET',
						dataType: 'json',
						url: options.ajaxURL,
						cache: false
					})
					.done(options.ajaxDone)
					.fail(options.ajaxFail)
					.always(options.ajaxAlways);
			}
		});
	return $modal;


}

// Written for: http://stackoverflow.com/questions/4671713/#7431801
// by Nathan MacInnes, nathan@macinn.es

// use square bracket notation for Closure Compiler
OP.breakLines = $.fn.breakLines = function (options) {
	var defaults = {
		// HTML to insert before each new line
		'lineBreakHtml': '<br />',
		// Set this to true to have the HTML inserted at the start of a
		// <p> or other block tag
		'atStartOfBlocks': false,
		// false: <LINEBREAK><span>text</span>;
		// true: <span><LINEBREAK>text</span>
		'insideStartOfTags': false,
		// If set, the element's size will be set to this before being
		// wrapped, then reset to its original value aftwerwards
		'widthToWrapTo': false
	};
	options = $.extend(defaults, options);
	return this.each(function () {
		var textNodes, // all textNodes (as opposed to elements)
			copy, // jQuery object for copy of the current element
			el = $(this), // just so we know what we're working with
			recurseThroughNodes, // function to do the spitting/moving
			insertedBreaks, // jQuery collection of inserted line breaks
			styleAttr; // Backup of the element's style attribute

		// Backup the style attribute because we'll be changing it
		styleAttr = $(this).attr('style');

		// Make sure the height will actually change as content goes in
		el.css('height', 'auto');

		// If the user wants to wrap to a different width than the one
		// set by CSS
		if (options.widthToWrapTo !== false) {
			el.css('width', options.widthToWrapTo);
		}

		/*
		    This function goes through each node in the copy and splits
		    it up into words, then moves the words one-by-one to the
		    element. If the node it encounters isn't a text node, it
		    copies it to the element, then the function runs itself again,
		    using the copy as the currentNode and the equivilent in the
		    copy as the copyNode.
		*/
		recurseThroughNodes = function (currentNode, copyNode) {
			$(copyNode).contents().each(function () {
				var nextCopy,
					currentHeight;

				// update the height
				currentHeight = el.height();

				// If this is a text node
				if (this.nodeType === 3) {
					// move it to the original element
					$(this).appendTo(currentNode);
				} else {
					// Make an empty copy and put it in the original,
					// so we can copy text into it
					nextCopy = $(this).clone().empty()
						.appendTo(currentNode);
					recurseThroughNodes(nextCopy, this);
				}

				// If the height has changed
				if (el.height() !== currentHeight) {
					// insert a line break and add to the list of
					// line breaks
					insertedBreaks = $(options.lineBreakHtml)
						.insertBefore(this)
						.add(insertedBreaks);
				}
			});
		};

		// Clone the element and empty the original
		copy = el.clone().insertAfter(el);
		el.empty();

		// Get text nodes: .find gets all non-textNode elements, contents
		// gets all child nodes (inc textNodes) and the not() part removes
		// all non-textNodes.
		textNodes = copy.find('*').add(copy).contents()
			.not(copy.find('*'));

		// Split each textNode into individual textNodes, one for each
		// word
		textNodes.each(function (index, lastNode) {
			var startOfWord = /\W\b/,
				result;
			while (startOfWord.exec(lastNode.nodeValue) !== null) {
				result = startOfWord.exec(lastNode.nodeValue);
				// startOfWord matches the character before the start of a
				// word, so need to add 1.
				lastNode = lastNode.splitText(result.index + 1);
			}
		});

		// Go through all the nodes, going recursively deeper, until we've
		// inserted line breaks in all the text nodes
		recurseThroughNodes(this, copy);

		// We don't need the copy anymore
		copy.remove();

		// Clean up breaks at start of tags as per options
		insertedBreaks.filter(':first-child').each(function () {
			if (!options.atStartOfBlocks &&
				$(this).parent().css('display') === "block") {
				$(this).remove();
			}
			if (!options.insideStartOfTags) {
				$(this).insertBefore($(this).parent());
			}
		});
		// Restore backed-up style attribute
		$(this).attr('style', styleAttr);
	});
};

OP.ajaxForm = function (form) {
	$(form).on('submit', function () {
		$.post('server.php', $('#theForm').serialize())

		return false;
	});
}

var OPLiveForm = function (options) {

	/** options:
	container:
	enableOnLoad: true|*false: enables the form immediately
	disableOnSubmit: *true|false: enables the form immediately
	submitURL:
	onLoad:
	onSubmit:
	onSuccess: after ajax call
	**/
	this.container = $(options.container);
	this.notEditables = this.container.find('.notEditable');
	this.editables = this.container.find('.editable');
	this.selectables = this.container.find('.selectable');
	this.removables = this.container.find('.removable');
	this.toggleables = this.container.find('.toggleable');

	this.enableOnLoad = (typeof options.enableOnLoad !== 'undefined') ? options.enableOnLoad : false;
	this.disableOnSubmit = (typeof options.disableOnSubmit !== 'undefined') ? options.disableOnSubmit : true;

	this.onSuccess = (_.isFunction(options.onSuccess)) ? options.onSuccess : false;
	this.onSubmit = (_.isFunction(options.onSubmit)) ? options.onSubmit : false;
	this.onLoad = (_.isFunction(options.onLoad)) ? options.onLoad : false;
	this.onEnable = (_.isFunction(options.onEnable)) ? options.onEnable : false;
	this.onDisable = (_.isFunction(options.onDisable)) ? options.onDisable : false;
	this.onAlways = (_.isFunction(options.onAlways)) ? options.onAlways : false;
	this.onFail = (_.isFunction(options.onFail)) ? options.onFail : false;
	this.submitURL = options.submitURL;

	var self = this;



	if (this.onLoad) this.onLoad();
	if (options.enableOnLoad) {
		this.enable();
	}
	return this;

}

OPLiveForm.prototype.enable = function () {
	var self = this;
	this.container.addClass('edit OPLiveForm');
	this.container.find('.notEditable')
		.css('opacity', 0)
		.css('pointer-events', 'none');
	this.container.find('.editable')
		.addClass('edit')
		//.attr('contentEditable', true);
		.each(function () {
			$(this).html($(this).html().trim()); //remove any whitespace after/before to prevent html whitespaces
			var textAreaSettings = {
				allowHTML: false, //allow HTML formatting with CTRL+b, CTRL+i, etc.
				allowImg: false, //allow drag and drop images
				singleLine: $(this).hasClass('singleLine'), //make a single line so it will only expand horizontally
				pastePlainText: true, //paste text without styling as source
				placeholder: false //a placeholder when no text is entered. This can also be set by a placeholder="..." or data-placeholder="..." attribute
			}
			$(this).toTextarea(textAreaSettings).toTextarea('enable');
		});

	this.container.find('.removable, .selectable,.toggleable')
		.addClass('edit');



	//selectables: turns children into radio buttons, only on click
	this.selectables.find('a')
		.on('click', function (e) {
			e.preventDefault();
		});

	this.selectables.children().off('click').on('click', function () {
		$(this.parentElement).children().removeClass('selected');
		$(this).addClass('selected');
	})

	//setup removable behavior
	this.removables.children().off('click').on('click', function () {
		$(this).remove();
	});

	this.toggleables.off('click').on('click', function (e) {
		e.preventDefault();
		$(this).toggleClass('selected');
	});

	//prevent html pasting
	/* disabled: toTextarea handles this now
	this.container.find('[contenteditable]')
	    .off('paste')
	    .on('paste', function (e) {
	        e.preventDefault();
	        var text = (e.originalEvent || e).clipboardData.getData('text/html') || '';
	        var safeText = $('<div></div>').html(text).text();
	        $(this).text(safeText);
	    });
	    */
	if (self.onEnable) this.onEnable();
	return self;
}
OPLiveForm.prototype.disable = function () {
	var self = this;
	this.container.removeClass('edit OPLiveForm');

	this.editables.removeClass('edit')
		//.attr('contentEditable', false);
		.toTextarea('disable');
	this.removables.removeClass('edit');
	this.selectables.removeClass('edit');
	this.toggleables.removeClass('edit');
	this.toggleables.off('click');
	if (self.onDisable) self.onDisable();
	return self;
}
OPLiveForm.prototype.getFormData = function () {
	var self = this;
	//collect form data to submit
	var formData = {};
	this.container.find('input:not([type="radio"])').each(function () {
		var name = $(this).attr('name');
		var value = $(this).val().trim();
		formData[name] = value;
	});
	this.container.find('input[type="radio"]:checked').each(function () {
		var name = $(this).attr('name');
		var value = $(this).val().trim();
		formData[name] = value;
	});
	this.container.find('.editable:not(input)').each(function () {
		var name = $(this).attr('name');
		var value = $(this).text().trim();
		formData[name] = value;
	});
	this.selectables.each(function () {
		var name = $(this).attr('name');
		var value = $(this).find('.selected').attr('value');
		formData[name] = value;
	});
	this.removables.each(function () {
		var name = $(this).attr('name');
		var value = [];
		$(this).children().each(function () {
			value.push($(this).attr('value'));
		});
		formData[name] = value;
	});
	this.toggleables.each(function () {
		var name = $(this).attr('name');
		var value = $(this).hasClass('selected');
		formData[name] = value;
	});
	return formData;
}
OPLiveForm.prototype.submit = function () {
	var self = this;
	//disable form elements
	if (this.disableOnSubmit) {
		this.disable();
	}

	var onSuccessFunction = function (response) {
		self.notEditables
			.css('opacity', '')
			.css('pointer-events', '');

		if (self.onSuccess) self.onSuccess(JSON.parse(response));
		return false;
	}
	$.post(self.submitURL, self.getFormData(), onSuccessFunction)
		.fail(function (response) {
			var message = response.responseJSON ? response.responseJSON.message : response.statusText;
			if (self.onFail) {
				self.onFail(message);
			} else {
				OP.showMessageModal("Oops, we got some problem here:  " + message);
			}
		})
		.always(function () {
			if (self.onAlways) self.onAlways();
		});
	if (self.onSubmit) self.onSubmit();
	return self;
}


jQuery.fn.extend({
	ajaxButton: function () {
		var normalText = $(this).text();
		var loadingText = $(this).attr('data-loading-text');
		$(this)
			.off('click.ajaxButton')
			.on('click.ajaxButton', function () {
				$(this)
					.addClass('disabled')
					.attr('disabled', 'true')
					.text($(this).attr('data-loading-text'));
			});
		return $(this);
	},
	resetButton: function () {
		$(this)
			.removeClass('disabled')
			.removeAttr('disabled')
			.text($(this).attr('data-normal-text'));
		return $(this);
	}

});

OP.linkify = function (text) {
	var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	return text.replace(urlRegex, function (url) {
		return '<a href="' + url + '">' + url + '</a>';
	});
}

/**
 * a shortcut function to use in filtering
 * eg. d3.selection.filter(ff('property'), 'student') instead of
 * d3.selection.filter(function(d){ return d.property == 'student' })
 * or in mapping
 * eg. d3.selection.map(ff('property')) instead of
 * d3.selection.map(function(d){ return d.property })
 * @method ff
 * @property {String} key Property name to look up
 * @property {String} value If provided, will be used for equality comparison for filtering
 * @return {Function} filtering (if value is provided) or mapping function
 */
ff = function (key, value) {
	if (typeof value != 'undefined') {
		if (Array.isArray(value))
			return function (f) {
				return value.indexOf(f[key]) > -1
			};
		else
			return function (f) {
				return f[key] === value
			};
	} else {
		return function (f) {
			return f[key]
		};
	}
}

function isProd() {
	return window.location.hostname == 'www.openprocessing.org' || window.location.hostname == 'openprocessing.org';
}
//compares version numbers for sorting. eg 1.0.9 vs 1.0.11
function compareVersions(a, b) {
	var i, diff;
	var regExStrip0 = /(\.0+)+$/;
	var segmentsA = a.replace(regExStrip0, '').split('.');
	var segmentsB = b.replace(regExStrip0, '').split('.');
	var l = Math.min(segmentsA.length, segmentsB.length);

	for (i = 0; i < l; i++) {
		diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
		if (diff) {
			return diff;
		}
	}
	return segmentsA.length - segmentsB.length;
}

function sortFunction(value, descending){
	let multiplier = descending ? -1:1;
	return function(a,b){ return a[value] > b[value]? 1*descending: -1*descending };
}

OP.cookie = {
	getItem: function (sKey) {
		if (!sKey) {
			return null;
		}
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
		if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
			return false;
		}
		var sExpires = "";
		if (vEnd) {
			switch (vEnd.constructor) {
				case Number:
					sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
					break;
				case String:
					sExpires = "; expires=" + vEnd;
					break;
				case Date:
					sExpires = "; expires=" + vEnd.toUTCString();
					break;
			}
		}
		document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
		return true;
	},
	removeItem: function (sKey, sPath, sDomain) {
		if (!this.hasItem(sKey)) {
			return false;
		}
		document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
		return true;
	},
	hasItem: function (sKey) {
		if (!sKey) {
			return false;
		}
		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	},
	keys: function () {
		var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
		for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
			aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
		}
		return aKeys;
	}
};