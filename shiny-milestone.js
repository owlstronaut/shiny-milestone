var fs = require('fs');
var GitHubApi = require("github");
var _ = require('underscore')._;

var github = new GitHubApi({
    version: "3.0.0"
});


fs.readFile('.config', 'utf-8', function(err, data) {
  var config = JSON.parse(data);

  github.authenticate({
    type: "basic",
    username: config.username,
    password: config.password
  });

  fs.writeFileSync('index.html', '<link href="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/css/bootstrap-combined.min.css" rel="stylesheet">');
  fs.appendFileSync('index.html', '<link href="http://devsmithy.com/hosted/css/style.css" rel="stylesheet">');
  fs.appendFileSync('index.html', '<h1 class="page-title">Release Notes</h1>');
  fs.appendFileSync('index.html', _.template('<h2 class="release-title"><%= milestone %></h2>')(config));
  fs.appendFileSync('index.html', '<div class="sort-by"></div>')

  getRepo(config);
  fs.appendFileSync('index.html', '<script src="http://cdnjs.cloudflare.com/ajax/libs/jquery/1.8.1/jquery.min.js"></script>');
  fs.appendFileSync('index.html', '<script src="http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3/underscore-min.js"></script>');
  fs.appendFileSync('index.html', '<script src="http://cdnjs.cloudflare.com/ajax/libs/underscore.string/2.0.0/underscore.string.min.js"></script>');
  fs.appendFileSync('index.html', '<script src="http://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.1.0/bootstrap.min.js"></script>');
  fs.appendFileSync('index.html', '<script src="http://devsmithy.com/hosted/main.js"></script>');
});

function getRepo(config) {
  if (config.org)
    getRepoFromOrg(config);
  else
    getRepoFromUser(config);
}

function getRepoFromOrg(config) {
  github.repos.getFromOrg({'org': config.org}, function(err, repos) {
    var repo = _.find(repos, function(repo){return repo.name == config.repo;});
    
    if (repo)
      useRepo(repo, config);
    else
      console.log('No repository retrieved: ' + repo);
  });
}

function getRepoFromUser(config) {
  github.repos.getAll({'type': 'all'}, function(err, repos) {
    var repo = _.find(repos, function(repo){return repo.name == config.repo;});

    if (repo)
      useRepo(repo, config);
    else
      console.log('No repository retrieved: ' + repo);
  });
}

function useRepo(repo, config) {
  var user = config.org || config.username;
  var repo_name = repo.name;

  github.issues.repoIssues({'user': user, 'repo': repo_name, 'state': 'closed'}, function(err, closed_issues) {
    github.issues.repoIssues({'user': user, 'repo': repo_name, 'state': 'open'}, function(err, open_issues) {
      var issues = closed_issues.concat(open_issues);
      useIssues(issues, config);
    });
  });
}

function useIssues(issues, config) {
  issues = _.sortBy(issues, 'number');

  _.each(issues, function(issue) {
    if (issue && issue.milestone && issue.milestone.title == config.milestone) {
      if (!issue.assignee)
        issue.assignee = {'login': 'unassigned', 'avatar_url': 'http://octodex.github.com/images/nyantocat.gif'};

      fs.appendFileSync('index.html', _.template('<div class="issue-line" rel="tooltip" data-placement="left" title="<%= assignee.login %><br><img src=<%= assignee.avatar_url %>>" data-assignee="<%= assignee.login %>" data-assignee-avatar-url="<%= assignee.avatar_url %>" data-state="<%= state %>">')(issue));
      _.each(issue.labels, function(label) {
        fs.appendFileSync('index.html', _.template('<span data-name="<%= name %>" class="label" style="background-color: #<%= color %>"><%= name %></span>')(label));
      });
      fs.appendFileSync('index.html', _.template('<span class="issue-title"><%= title %> (<a href="<%= html_url %>">Issue #<%= number %></a>)</span>')(issue));
      fs.appendFileSync('index.html', '<br>');
      fs.appendFileSync('index.html', _.template('<span class="issue-body" style="display: none"><pre><img class="usr-img" data-placement="right" rel="tooltip" title="<%= user.login %>" src="<%= user.avatar_url %>">\n\n<%= body %></pre></span>')(issue));
      fs.appendFileSync('index.html', '</div>');
    }
  });
}
