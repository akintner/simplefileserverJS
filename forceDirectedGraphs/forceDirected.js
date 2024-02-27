function GraphNode(){
  this.pos = new Vector(Math.random()* 1000, Math.random()*1000);
  this.edges = [];
}

GraphNode.prototype.conect = function(other){
  this.edges.push(other);
  this.edges.push(this);
};
GraphNode.prototype.hasEdge = function(other){
  for (var i=0; i < this.edges.length; i++)
    if (this.edges[i] == other)
      return true;
};

function treeGraph(depth, branches){
  var graph = []
  function buildNode(depth){
    var node = new GraphNode();
    graph.push(node);
    if (depth >1)
      for (var i=0; i< branches; i++)
        node.connect(buildNode(depth -1));
    return node;
  }
  buildNode(depth);
  return graph;
}
var springLength = 40;
var springStrength = 0.1;
var repulsion = 1500;

// function forceDirected(graph){
//   graph.forEach(fcuntion(node){
//     graph.forEach(function(other){
//       if (other == node) return;
//       var apart = other.pos.minus(node.pos);
//       var distance = Math.max(1, apart.length);
//       var forceSize = -repulsion / (distance * distance);
//       if (node.hasEdge(other))
//         forceSize += (distance - springLength) * springStrength;
//       var normallized = apart.times(1 / distance);
//       node.pos = node.pos.plus(normallized.times(forceSize))
//     });
//   });
// }

function runLayout(impl, graph){
  var steps = 0, time = 0;
  function step(){
    var start = Date.now();
    for (var i = 0; i< 100; i++)
      impl(graph);
    steps += 100;
    time = Date.now() - start;
    drawGraph(graph);
    if (steps < 4000)
      requestAnimationFrame(step)
    else
      console.log(time);
  }
  step();
}

//When timing the orginal forceDirection function, we can see that there are several things
//slowing it down, the most interesting of which are the two for loops computing position of node
//and other in the graph. Javascript compilation engines in browsers don't inline forEach calls, so
//a function is created in a special piece of memory, thus slowing things down. The solution is to
//use a traditional for loop for the inner loops, which is less pretty, but more functional. This also
//includes a micro-optimization for computation of the node positions, since one is simply the opposite
//of the other (there's no need to do that work twice).
function forceDirected_forloop_norepeat(graph){
  for (var i=0; i < graph.length; i++) {
    var node = graph[i];
    for (var j = 0; j < graph.length; j++){
      if (i == j) continue;
      var other = graph[j];
      var apart = other.pos.minus(node.pos);
      var distance = Math.max(1, apart.length);
      var forceSize = -repulsion / (distance * distance);
      if (node.hasEdge(other))
        forceSize += (distance - springLength) * springStrength;
      var applied = apart.times(forceSize/distance);
      node.pos = node.pos.plus(applied);
      other.post = other.pos.minus(applied)
    }
  }
}
