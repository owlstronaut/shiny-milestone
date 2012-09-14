$(document).ready(function() {

  $(document).on('click', '.issue-title', toggleIssue);
  if ($("[rel=tooltip]").length) {
    $("[rel=tooltip]").tooltip();
  }

});

function toggleIssue(evt) {
  $(evt.target).siblings('.issue-body').toggle();

}