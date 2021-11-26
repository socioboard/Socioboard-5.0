var paginationId = 1;
var paginate = true;

jQuery(document).ready(function($) {
		$('#sb_loader').append('<div class="d-flex justify-content-center" >\n' +
			'        <div class="spinner-border" role="status"  id="" style="display: none;">\n' +
			'            <span class="sr-only">Loading...</span>\n' +
			'        </div>\n' +
			'\n' +
			'        </div>');
		$(".spinner-border").css("display", "block");
	if(paginate){
		paginate = false;
		sendAjax();
	}
});

$(window).on('scroll',function(event) {
	if($(this).scrollTop() + $(this).height() >= $(document).height() - 100 ) {
		if(paginate){
			paginationId++;
			paginate = false;
    		sendAjax();
		}
	}
});


function sendAjax(){
	$.ajaxSetup({
		headers: {
			'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
		}
	});

	let page = $("body").find("#Sb_content").data('page')
	let slug = $("body").find("#Sb_content").data('slug')
	let data = {
		"paginationId" : paginationId,
		"page" : page,
		"slug" : slug,
	}

	$.ajax({
		url: '/home/publishing/history-show',
		type: 'POST',
		data : data,
		dataProcess : false,
		cache : false,
		success : (r)=>{
			$('#sb_loader').empty();
			if(r.html.length > 0){
				$('body').find('#table-div tbody').append(r.html)
				paginate = true;
			}

			else{
				$("#table-div").append(`
						<p style="width:100%;padding:10px;text-align:center; color:white">End of content</p>
					`)
			}
		}
	})
}