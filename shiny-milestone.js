var fs = require('fs');
var GitHubApi = require("github"); // http://ajaxorg.github.com/node-github/
var _ = require('underscore')._;
var prompt = require('prompt');

var github = new GitHubApi({
    version: "3.0.0"
});

var config;
promptForPassword();

// Debugging
// startApplication(password);

function promptForPassword() {
 var prompt_props = [{'name': 'password', 'hidden': true}];
  prompt.start();
  prompt.get(prompt_props, function(err, result) {
    if (err)
      return console.log('Password entered incorrectly. Please try again.');

    startApplication(result.password);
  });
}

function startApplication(password) {
  fs.readFile('.config', 'utf-8', function(err, data) {
    config = JSON.parse(data);
    config.name = config.name || 'index.html';

    github.authenticate({
      type: "basic",
      username: config.username,
      password: password
    });
    console.log('Authenticated Credentials');

    fs.writeFileSync(config.name, '<link href="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/css/bootstrap-combined.min.css" rel="stylesheet">');
    fs.appendFileSync(config.name, '<link href="http://devsmithy.com/hosted/css/style.css" rel="stylesheet">');
    fs.appendFileSync(config.name, '<h1 class="page-title">Release Notes</h1>');
    fs.appendFileSync(config.name, _.template('<h2 class="release-title"><%= milestone %></h2>')(config));
    fs.appendFileSync(config.name, '<div class="sort-by"></div>');

    getRepo();
    fs.appendFileSync(config.name, '<script src="http://cdnjs.cloudflare.com/ajax/libs/jquery/1.8.1/jquery.min.js"></script>');
    fs.appendFileSync(config.name, '<script src="http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3/underscore-min.js"></script>');
    fs.appendFileSync(config.name, '<script src="http://cdnjs.cloudflare.com/ajax/libs/underscore.string/2.0.0/underscore.string.min.js"></script>');
    fs.appendFileSync(config.name, '<script src="http://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.1.0/bootstrap.min.js"></script>');
    fs.appendFileSync(config.name, '<script src="http://devsmithy.com/hosted/main.js"></script>');
  });
}

function getRepo() {
  if (config.org)
    getRepoFromOrg();
  else
    getRepoFromUser();
}

function getRepoFromOrg() {
  github.repos.getFromOrg({'org': config.org}, function(err, repos) {
    var repo = _.find(repos, function(repo){return repo.name == config.repo;});
    
    if (repo) {
      useRepo(repo);
      console.log('Found Repository: ' + repo.name);
    }
    else {
      console.log('No repository retrieved: ' + repo);
    }
  });
}

function getRepoFromUser() {
  github.repos.getAll({'type': 'all'}, function(err, repos) {
    var repo = _.find(repos, function(repo){return repo.name == config.repo;});

    if (repo) {
      useRepo(repo);
      console.log('Found Repository: ' + repo.name);
    }
    else {
      console.log('No repository retrieved: ' + repo);
    }
  });
}

function useRepo(repo) {
  var user = config.org || config.username;
  var repo_name = repo.name;

  github.issues.getAllMilestones({'user': user, 'repo': repo_name}, function(err, milestones) {
    var milestone = _.find(milestones, function(milestone){return milestone.title == config.milestone;});
    console.log(_.template('Found Milestone <%= title %>')(milestone));
    includeClosedIssues(user, repo_name, milestone.number);
  });
}

function includeClosedIssues(user, repo_name, milestone) {
  github.issues.repoIssues({'user': user, 'repo': repo_name, 'state': 'closed', 'milestone': milestone, 'per_page': 100}, function(err, closed_issues) {
    if (err)
      throw err;

    if (config.include_open_issues) {
      includeOpenIssues(user, repo_name, closed_issues, milestone);
    }
    else {
      console.log('Found ' + closed_issues.length + ' Closed Repository Issues');
      useIssues(closed_issues);
    }
  });
}

function includeOpenIssues(user, repo_name, closed_issues, milestone) {
  github.issues.repoIssues({'user': user, 'repo': repo_name, 'state': 'open', 'milestone': milestone, 'per_page': 100}, function(err, open_issues) {
    if (err)
      throw err;

    var issues = closed_issues.concat(open_issues);
    console.log('Found ' + issues.length + ' Open/Closed Repository Issues');
    useIssues(issues);
  });
}

function useIssues(issues) {
  issues = _.sortBy(issues, 'number');

  _.each(issues, function(issue) {
    if (!issue.assignee)
      issue.assignee = {'login': 'unassigned', 'avatar_url': 'http://octodex.github.com/images/nyantocat.gif'};

    fs.appendFileSync(config.name, _.template('<div class="issue-line" rel="tooltip" data-placement="left" title="<%= assignee.login %><br><img src=<%= assignee.avatar_url %>>" data-assignee="<%= assignee.login %>" data-assignee-avatar-url="<%= assignee.avatar_url %>" data-state="<%= state %>">')(issue));
    _.each(issue.labels, function(label) {
      fs.appendFileSync(config.name, _.template('<span data-name="<%= name %>" class="label" style="background-color: #<%= color %>"><%= name %></span>')(label));
    });
    fs.appendFileSync(config.name, _.template('<span class="issue-title"><%= title %> (<a href="<%= html_url %>">Issue #<%= number %></a>)</span>')(issue));
    fs.appendFileSync(config.name, '<br>');
    fs.appendFileSync(config.name, _.template('<span class="issue-body" style="display: none"><pre><img class="usr-img" src="<%= user.avatar_url %>"><span class="usr-name">Creator: <%= user.login %></span>\n\n<%= body %></pre></span>')(issue));
    fs.appendFileSync(config.name, '</div>');
  });

  fs.appendFileSync(config.name, '<div class="no-issues">No issues match the selected filters.</div>');
  console.log('Done Generating ' + config.name);
}
