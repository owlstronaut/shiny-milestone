$(document).ready(function() {

  $(document).on('click', '.issue-title', toggleIssue);
  enableTooltips();
  setupSortBy();
  setupCollapse();
});

function setupCollapse() {
  var sort_by = $(document).find('.sort-by');
  var collapse = $('<span class="collapse-issues btn">Collapse All</span>');
  collapse.click(onCollapse);
  sort_by.append(collapse);
}

function onCollapse() {
  _.each($('.issue-title'), function(issue_title) {
    if (isIssueVisible(issue_title))
      toggleIssue({'target': issue_title});
  });
}

function isIssueVisible(issue_title) {
  return $(issue_title).siblings('.issue-body').css('display') != 'none';
}

function enableTooltips() {
  if ($("[rel=tooltip]").length)
    $("[rel=tooltip]").tooltip({});
}

function toggleIssue(evt) {
  $(evt.target).siblings('.issue-body').toggle();
}

function setupSortBy() {
  var label_names = getLabelNames();
  var labels = _.uniq(label_names);

  var sort_by = $(document).find('.sort-by');
  _.each(labels, function(label_data) {
    var label = $(_.template('<span data-label="<%= label_data %>" class="active label-filter btn btn-mini"><%= label_data %></span>')({'label_data': label_data}));
    label.click(updateVisible.bind(label));
    sort_by.append(label);
  });
}

function updateVisible(evt) {
  $(evt.currentTarget).toggleClass('active');

  _.each($('.issue-line'), function(issue_line) {
    var data_names = getDataNamesFromIssueLine(issue_line);
    updateVisibleLines(data_names, issue_line);
  });
}

function getDataNamesFromIssueLine(issue_line) {
  return _.map($(issue_line).find('.label'), function(label) {
    return $(label).attr('data-name');
  });
}

function updateVisibleLines(data_names, issue_line) {
  var active_labels = getActiveLabels();

  if (_.intersection(data_names, active_labels).length)
    $(issue_line).show();
  else
    $(issue_line).hide();
}

function getActiveLabels() {
  return _.map($(document).find('.sort-by .active.label-filter'), function(label) {return $(label).attr('data-label');});
}

function getLabelNames() {
  return _.map($('.issue-line .label'), function(label){return $(label).attr('data-name');});
}

function getIssueStates() {
  return _.map($('.issue-line'), function(issue_line){return $(issue_line).attr('data-state');});
}