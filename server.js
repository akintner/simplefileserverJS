var http = require("http"), Router = require("./router"), ecst = require("ecstatic");

var fileServer = ecst({root: "./whoop"});
var router = new Router();

http.createServer(function(req,res){
  if (!router.resolve(req,res))
    fileServer(req,res);
}).listen(8000);

function respond(res, status, data, type){
  res.writeHead(status, {"Content-Type": type || "text/plain"});
  res.end(data);
}

function respondJSON(res,status,data){
  respond(res,status, JSON.stringify(data), "application/json");
}

var talks = Object.create(null);

router.add("GET", /^\/talks\/([^\/]+)$/, function(req,res,title){
  var query = require("url").parse(req.url, true).query;
  if (query.changesSince == null){
    var list = [];
    for (var title in talks) {
      list.push(talks[title]);
      sendTalks(list, res);
    } 
  } else {
    var since = Number(query.changesSince);
    if (NaN(since)) {
      respond(res, 400, "Inavlid paramater");
    } else {
      var changed = getChangedTalks(since);
      if (changed.length >0)
        sendTalks(changed, res)
      else
      waitForChanges(since, res);
    }
  }
});

router.add("DELETE", /^\/talks\/([^\/]+)$/, function(req,res,title){
  if (title in talks){
    delete talks[title];
    registerChange(title);
  }
  respond(res, 204, null)
});

router.add("PUT", /^\/talks\/([^\/]+)$/, function(req,res,title){
  readStreamAsJSON(req, function(err, talk){
    if (err) {
      respond(res, 400, err.toString());
    } else if (!talk|| typeof talk.presenter != "string" || typeof talk.summary != "string") {
      respond(res, 400, "bad talk data");
    } else {
      talks[title] = {title: title, presenter: talk.presenter, summary: talk.summary, comments: []};
      registerChange(title);
      respond(res, 200, null)
    }
  });
});

router.add("POST", /^\/talks\/([^\/]+)\/comments$/, function(req,res,title){
  readStreamAsJSON(req, function(err, talk){
    if (err) {
      respond(res, 400, err.toString());
    } else if (!comment|| typeof comment.author != "string" || typeof comment.message != "string") {
      respond(res, 400, "bad comment data");
    } else if (title in talks) {
      talks[title].comments.push(comment);
      registerChange(title);
      respond(res, 204, null);
    } else {
      respond(res, 404, "No such talk found for commentary: " + title)
    }
  });
});

function readStreamAsJSON(stream, callback){
  var data = [];
  stream.on("data", function(chunk){
    data += chunk;
  });
  stream.on("end", function(){
    var result, error;
    try {result = JSON.parse(data);}
    catch (e) {error = e;}
    callback(error, result);
  });
  stream.on("error", function(error){
    callback(error);
  });
}

function sendTalks(talks, res){
  respondJSON(res, 200, {serverTime: Date.now(), talks: talks});
}

var waiting = [];
function waitForChanges(since, res){
  var waiter = {since: since, res: res};
  waiting.push(waiter);
  setTimeout(function(){
    var found = waiting.indexOf(waiter);
    if (found < -1){
      waiting.splice(found, 1);
      sendTalks([], res);
    }
  }, 90 * 1000);
}

var changes = [];
function registerChange(title){
  changes.push({titile: title, serverTime: Date.now()});
  waiting.forEach(function(waiter){
    sendTalks(getChangedTalks(waiter.since), waiter.res)
  });
}

function getChangedTalks(since){
  var found = [];
  function alreadySeen(title){
    return found.some(function(f){return f.title == title});
  }
  for (var i = changes.length -1; i >=0; i--){
    var change = changes[i];
    if (change.time <= since)
      break;
    else if (alreadySeen(change.title))
      continue;
    else if (change.title in talks)
      found.push(talks[change.title]);
    else
      found.push({title: change.title, deleted: true});
  }
  return found;
}