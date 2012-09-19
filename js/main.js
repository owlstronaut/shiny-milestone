$(document).ready(function() {

  $(document).on('click', '.issue-title', toggleIssue);
  if ($("[rel=tooltip]").length) {
    $("[rel=tooltip]").tooltip();
  }

  setupSortBy();

});

function toggleIssue(evt) {
  $(evt.target).siblings('.issue-body').toggle();
}

function setupSortBy() {
  var label_names = getLabelNames();
  var issue_states = getIssueStates();
  var labels = _.uniq(issue_states.concat(label_names));

  var sort_by = $(document).find('.sort-by');
  _.each(labels, function(label_data) {
    var label = $(_.template('<span data-label="<%= label_data %>" class="active label-filter btn btn-mini"><%= label_data %></span>')({'label_data': label_data}));
    label.click(updateVisible.bind(label));
    sort_by.append(label);
  });
}

function updateVisible(evt) {
  $(evt.currentTarget).toggleClass('active');

  
}

function getLabelNames() {
  return _.map($('.issue-line .label'), function(label){return $(label).attr('data-name');});
}

function getIssueStates() {
  return _.map($('.issue-line'), function(issue_line){return $(issue_line).attr('data-state');});
}