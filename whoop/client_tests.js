// A simple test function to verify that the template instantiation actually works

function test(template, values, expected) {
  var testTemplate = document.createElement("div");
  testTemplate.innerHTML = template;
  var result = instantiateTemplate(testTemplate, values).innerHTML;
  if (result != expected)
    console.log("Unexpected instantiation. Expected\n  " + expected + "\ngot\n  " + result);
}

test('<h1 template-when="header">{{header}}</h1>',
     {header: "One"},
     '<h1 template-when="header">One</h1>');

test('<h1 template-when="header">{{header}}</h1>',
     {header: false},
     '');

test('<p><img src="icon.png" template-unless="noicon">Hello</p>',
     {noicon: true},
     '<p>Hello</p>');

test('<ol><li template-repeat="items">{{name}}: {{score}}</li></ol>',
     {items: [{name: "Jean Luc Picard", score: "7"}, {name: "Q", score: "one million out of 10"}]},
     '<ol><li template-repeat="items">Jean Luc Picard: 7</li><li template-repeat="items">Q: one million out of 10</li></ol>');
