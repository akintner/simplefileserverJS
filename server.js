var http = require("http"), Router = require("./router"), ecst = require("ecstatic");

var fileServer = ecst({root: "./whoop"});
var router = new Router();

http.createServer(function(req,res){
  if (!router.resolve(req,res))
    fileServer(req,res);
}).listen(8000);