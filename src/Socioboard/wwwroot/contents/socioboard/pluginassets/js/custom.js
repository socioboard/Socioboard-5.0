$(document).on('ready', function () {
	$modal = $('.modal-frame');
	$overlay = $('.modal-overlay');

	/* Need this to clear out the keyframe classes so they dont clash with each other between enter/leave. Cheers. */
	$modal.bind('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (e) {
		if ($modal.hasClass('state-leave')) {
			$modal.removeClass('state-leave');
		}
	});

	$('.close').on('click', function () {
		$overlay.removeClass('state-show');
		$modal.removeClass('state-appear').addClass('state-leave');
	});

	$('.open').on('click', function () {
		$overlay.addClass('state-show');
		$modal.removeClass('state-leave').addClass('state-appear');
	});

});

(function () {
	$(function () {
		return $('.file-upload__input').on('change', function () {
			return $('.file-upload__label').html([
                this.files.length,
                'Files to upload'
            ].join(' '));
		});
	});
}.call(this));