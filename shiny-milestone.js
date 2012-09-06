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

  fs.writeFileSync('index.html', '<link rel="stylesheet" href="style.css">')
  fs.appendFileSync('index.html', '<h1 class="page-title">Release Notes</h1>')
  fs.appendFileSync('index.html', '<h2 class="release-title">' + config.milestone + '</h2>');

  getRepo(config);
});

function getRepo(config) {
  github.repos.getFromOrg({'org': config.org}, function(err, repos) {
    var repo;
    var i = 0;
    while (i < repos.length) {
      if (repos[i].name == config.repo) {
        repo = repos[i];
      }
      ++i;
    }

    useRepo(repo, config);
  });
}

function useRepo(repo, config) {
  github.issues.repoIssues({user: config.org, repo: repo.name, state: 'closed'}, function(err, closed_issues) {
    github.issues.repoIssues({user: config.org, repo: repo.name, state: 'open'}, function(err, open_issues) {
      var issues = closed_issues.concat(open_issues);
      useIssues(issues, config);
    });
  });
}

function useIssues(issues, config) {
  _.each(issues, function(issue) {
    if (issue && issue.milestone && issue.milestone.title == config.milestone) {
      fs.appendFileSync('index.html', '<div class="issue-line">');
      _.each(issue.labels, function(label) {
        fs.appendFileSync('index.html', '<span class="label" style="background-color: #' + label.color + '">' + label.name + '</span>');
      });
      fs.appendFileSync('index.html', '<span class="issue-title">' + issue.title + '</span>');
      fs.appendFileSync('index.html', '<br>');
      fs.appendFileSync('index.html', '</div>');
    }
  });
}