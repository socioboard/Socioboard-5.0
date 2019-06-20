$(function () {
    $('[data-toggle="tooltip"]').tooltip();
    $('.dropify').dropify();
})
$("#post_textarea").emojioneArea({
    pickerPosition: "right",
    tonesStyle: "bullet"
});