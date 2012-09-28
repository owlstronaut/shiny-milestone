$(document).ready(function() {
  $(document).on('click', '.issue-title', toggleIssue);
  setupSortBy();
  setupCollapse();
  enableTooltips();
});

function setupCollapse() {
  var sort_by = $(document).find('.sort-by');
  var collapse = $('<span class="collapse-issues btn">collapse all</span>');
  collapse.click(onCollapse);
  sort_by.append(collapse);
}

function onCollapse() {
  _.each($('.issue-title'), function(issue_title) {
    if (isIssueBodyVisible(issue_title))
      toggleIssue({'target': issue_title});
  });
}

function isAnyIssueVisible() {
  var issue_titles = _.map($('.issue-title'), function(issue_title) {
    return isIssueVisible(issue_title);
  });

  if (!_.any(issue_titles))
    $('.no-issues').show();
  else
    $('.no-issues').hide();
}

function isIssueVisible(issue_title) {
  return $(issue_title).is(':visible');
}

function isIssueBodyVisible(issue_title) {
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
  var label_nums = getLabelNums(label_names);
  var labels = _.uniq(label_names);

  var sort_by = $(document).find('.sort-by');
  var label;
  var label_num;
  _.each(labels, function(label_data) {
    label_num = _.find(label_nums, function(label_num){return label_num.label == label_data;});
    label = $(_.template('<span data-label="<%= label_data %>" rel="tooltip" title="<%= label_num %>" class="active label-filter btn btn-mini"><%= label_data %></span>')({'label_data': label_data, 'label_num': label_num.num}));
    label.click(updateVisible.bind(label));
    sort_by.append(label);
  });
}

function getLabelNums(label_names) {
  return _.map(_.uniq(label_names), function(uniq_label) {
    return {'label': uniq_label, 'num': _.filter(label_names, function(label){return label == uniq_label}).length};
  });
}

function updateVisible(evt) {
  $(evt.currentTarget).toggleClass('active');

  var data_names;
  _.each($('.issue-line'), function(issue_line) {
    data_names = getDataNamesFromIssueLine(issue_line);
    updateVisibleLines(data_names, issue_line);
  });

  isAnyIssueVisible();
  updateNumVisible();
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

function updateNumVisible() {
  var issue_lines = $('.issue-line');
  var visible_issues = _.filter(issue_lines, function(issue_line) {
    return $(issue_line).is(':visible');
  });

  if (issue_lines.length != visible_issues.length)
    $('.milestone-info .filtered').html(_.template('(filtered to <%= visible %>)')({'visible': visible_issues.length}));
  else
    $('.milestone-info .filtered').empty();
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