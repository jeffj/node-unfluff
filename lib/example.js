'use strict';

const extractor = require('./unfluff');
const fs = require('fs');
const _ = require('lodash');
const htmlparser = require("htmlparser2");


var fileDate;

fs.readFile('example.html', 'utf8', function(err, data) {
  if (err) throw err;
  fileDate = data;
});

//Lets require/import the HTTP module
var http = require('http');

//Lets define a port we want to listen to
const PORT=8080; 

//We need a function which handles requests and send response
function handleRequest(request, response){

	if (request.url=='/favicon.ico') return;

	response.writeHead(200, {"Content-Type": "application/json"});

	var data = extractor( fileDate);

	const result = parseTags(data.html);

	//data.textTags = result.tags;

	data.text = result;

	//data.text = linkSplice(data.html);
	var stringRes = JSON.stringify(data )
	

    response.end( stringRes );
}



function parseTags(txts){
	return _.map(txts, function(txt, i){
		return pull(txt)
	})
}

function pull(txt){
	var opentag={}
	var pulledText = '';
	var tags = [];
	var parser = new htmlparser.Parser({
	    onopentag: function(name, attribs){
	        opentag[name]={
	        	name: name,
	        	index : [pulledText.length],
	        	href: attribs.href
	        };
	    },
	    ontext: function(text){
	    	pulledText += text;
	        console.log("-->", text);
	    },
	    onclosetag: function(tagname){
	    	opentag[tagname].index[1]=pulledText.length;
	    	tags.push(opentag[tagname]);
	    }
	}, {decodeEntities: true});
	parser.write(txt);
	parser.end();

	return {
		text: pulledText,
		styles: _.filter(tags, function(value) {
  			return value.name !== 'a';
		}),
		link:  _.filter(tags, {name:'a'})
	}
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});