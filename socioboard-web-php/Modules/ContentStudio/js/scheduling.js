$(document).on('keyup change paste insert','.emojionearea-editor',function(e){
	$(".postText").html($(this).html())
})