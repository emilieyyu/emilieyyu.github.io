OP.showSigninModal = function (callbackFunction, title, description) {
	OP.setupSigninModal(callbackFunction);
	$('#signinModal h1').text(title ? title : 'Sign in');
	$('#signinModal .description').text(description ? tidescription : '');
	$('#signinModal').show();
	window.setTimeout(function () {
		$('#signinModal').addClass('in');
		$('#signinModal input[name="email"]').focus();
	}, 200);

}
OP.hideSigninModal = function (callbackFunction) {
	$('#signinModal').removeClass('in');
	window.setTimeout(function () {
		$('#signinModal').hide();
	}, 400);
}
OP.showJoinModal = function (callbackFunction, title, description) {
	OP.setupJoinModal(callbackFunction);
	$('#joinModal h1').text(title ? title : 'Join the Creative Coders on OpenProcessing');
	$('#joinModal .description').text(description ? description : '');
	$('#joinModal').show();
	window.setTimeout(function () {
		$('#joinModal').addClass('in');
		$('#joinModal input[name="fullname"]').focus();
	}, 200);

}
OP.hideJoinModal = function (callbackFunction) {
	$('#joinModal').removeClass('in');
	window.setTimeout(function () {
		$('#joinModal').hide();
	}, 400);
}

OP.setupSigninModal = function (callbackFunction) {

	$('#signinModal .joinLink').on('click', function () {
		OP.hideSigninModal()
		OP.showJoinModal(callbackFunction);
		return false;
	})
	$('#signinModal .modal_bg, #signinModal .icon_close').on('click', function () {
		OP.hideSigninModal();
	});

	var options = {
		dataType: 'json',
		beforeSubmit: function () {
			$('#signinModal .errorMessage').text('');
			$('#signinModal .submitButton').button('loading');
		},
		submit: function () {
			return false
		},
		success: function (response) {
			if (response.success === true) {

				$('html').removeClass('guest');
				$('#signinModal .submitButton').button('success').addClass('btn-success');

				//clog(response);
				sessionUser = (response.object) ? response.object : sessionUser;
				if (typeof callbackFunction != 'undefined' && callbackFunction != false) {
					OP.hideSigninModal();
					OP.setupNavForSignedinUser();
					window.setTimeout(callbackFunction, 400);
				} else {
					if (sessionUser.prevUrl && sessionUser.prevUrl != null) {
						location.href = sessionUser.prevUrl;
					} else {
						location.href = '/user/' + sessionUser.userID;
					}
				}

			}
		},
		error: function (response) {
			if (response.statusText == 'Multiple Users') {
				$('#signinModal .errorMessage').text('There are multiple accounts with that email address. Please also provide the username for the account.')
				$('#signinModal .usernameField').removeClass('hide').fadeIn(200)
					.find('input').focus();
			} else {
				$('#signinModal .errorMessage').text(response.statusText);
			}

		},
		complete: function (response) {
			if (!$('#signinModal .submitButton').hasClass('btn-success')) {
				$('#signinModal .submitButton').button('normal');
			}
		}

	};
	$('#signinForm').ajaxForm(options);
}



OP.setupJoinModal = function (callbackFunction) {

	$('#joinModal .signinLink').on('click', function () {
		OP.hideJoinModal()
		OP.showSigninModal(callbackFunction);
		return false;
	})
	OP.loadCaptcha();
	$('#joinModal .modal_bg, #joinModal .icon_close').on('click', function () {
		OP.hideJoinModal();
	});

	var options = {
		dataType: 'json',
		beforeSubmit: function () {
			$('#joinModal .errorMessage').text('');
			$('#joinModal .submitButton').button('loading');
		},
		submit: function () {
			return false
		},
		success: function (response) {
			if (response.success === true) {

				$('html').removeClass('guest');
				$('#joinModal .submitButton').addClass('btn-success').button('success');
				sessionUser = (response.object) ? response.object : sessionUser;
				if (typeof callbackFunction != 'undefined' && callbackFunction != false) {
					OP.hideJoinModal();
					OP.setupNavForSignedinUser();
					window.setTimeout(callbackFunction, 400);
				} else {
					if (sessionUser.prevUrl && sessionUser.prevUrl != null) {
						location.href = sessionUser.prevUrl;
					}else{
						location.href = '/user/'+sessionUser.userID;
					}
				}

			}
		},
		error: function (response) {
			if (response.statusText == 'Multiple Users') {
				$('#joinModal .errorMessage').text('There are multiple accounts with that email address. Please also provide the username for the account.')
				$('#joinModal .usernameField').removeClass('hide').fadeIn(200)
					.find('input').focus();
			} else {
				$('#joinModal .errorMessage').text(response.statusText);
			}

		},
		complete: function (response) {
			if (!$('#joinModal .submitButton').hasClass('btn-success')) {
				$('#joinModal .submitButton').button('reset');
			}
		}

	};
	$('#joinForm').ajaxForm(options);
}

OP.loadCaptcha = function () {
	if (typeof window.recaptcha == 'undefined') {
		$('body').append("<script src = 'https://www.google.com/recaptcha/api.js'></script >");
	}
}

OP.setupNavForSignedinUser =function(){
	$('html').removeClass('guest');
	OP.setupMembershipElements();
	$('.navigationContent a[name="mySketchesLink"]').href="/user/"+sessionUser.userID+"/#sketches";
	$('.navigationContent a[name="myFeedLink"]').href="/user/"+sessionUser.userID+"/#activity";
	$('.navigationContent a[name="myProfileLink"]').href="/user/"+sessionUser.userID+"/#edit";
}