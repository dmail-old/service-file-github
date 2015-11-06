/* global platform */

import rest from '../node_modules/@dmail/rest/index.js';
import httpService from '../node_modules/@dmail/service-http/index.js';

import replace from './replace.js';

/*
live example
var giturl = 'https://api.github.com/repos/dmail/argv/contents/index.js?ref=master';
var xhr = new XMLHttpRequest();
//var date = new Date();
//date.setMonth(0);

xhr.open('GET', giturl);
xhr.setRequestHeader('accept', 'application/vnd.github.v3.raw');
//xhr.setRequestHeader('if-modified-since', date.toUTCString());
xhr.send(null);
*/
function getFileFromGithub(request){
	var url = request.url;
	var pathname = url.pathname;
	var parts = pathname.slice(1).split('/');
	var user = parts[0];
	var repo = parts[1];
	var file = parts.slice(2);

	var data = {
		user: user,
		repo: repo,
		path: file || 'index.js',
		version: url.hash ? url.hash.slice(1) : 'master'
	};

	var giturl = replace('https://api.github.com/repos/{user}/{repo}/contents/{path}?ref={version}', data);
	var headers = {
		'accept': 'application/vnd.github.v3.raw',
		//'user-agent': 'jsenv' // https://developer.github.com/changes/2013-04-24-user-agent-required/
		// plus besoin puisque http va envoyer node
	};

	if( data.user && platform.config['github-' + data.user + '-token'] ){
		headers['authorization'] = 'token ' + platform.config['github-' + data.user + '-token'];
	}

	// transform the request into an httpRequest
	var httpRequest = rest.createRequest({
		url: giturl,
		method: 'GET',
		headers: request.headers,
		body: request.body
	});

	for(var headerName in headers){
		if( false === httpRequest.headers.has(headerName) ){
			httpRequest.headers.set(headerName, headers[headerName]);
		}
	}

	return httpService.handleRequest(httpRequest);
}

export default getFileFromGithub;