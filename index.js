/* global platform */

import rest from './node_modules/@dmail/rest/index.js';
import httpService from './node_modules/@dmail/service-http/index.js';

import replace from './lib/replace.js';
import Base64 from './lib/base64.js';

var githubFileService = rest.createService({
	name: 'file-github',
	tokens: {}, // tokens to be authentified when requesting github (private repo or post method for instance)

	parseURL(url){
		var pathname = url.pathname;
		var parts = pathname.slice(1).split('/');
		var user = parts[0];
		var repo = parts[1];
		var file = parts.slice(2);

		var data = {
			user: user,
			repo: repo,
			path: file || 'index.js',
			version: url.hash ? url.hash.slice(1) : 'master',
			headers: {}
		};

		if( data.user in this.tokens ){
			data.headers['authorization'] = 'token ' + this.tokens[data.user];
		}

		return data;
	},

	createHttpRequest(options){
		var httpRequest = rest.createRequest(options);
		return httpRequest;
	},

	fetchHttpRequest(httpRequest){
		return httpService.requestHandler(httpRequest);
	},

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
	get(request){
		var data = this.parseUrl(request.url);
		var giturl = replace('https://api.github.com/repos/{user}/{repo}/contents/{path}?ref={version}', data);
		var headers = data.headers;
		var body = request.body;

		headers['accept'] = 'application/vnd.github.v3.raw';
		//'user-agent': 'jsenv' // https://developer.github.com/changes/2013-04-24-user-agent-required/
		// plus besoin puisque http va envoyer node

		// transform the request into an httpRequest
		var httpRequest = rest.createRequest({
			url: giturl,
			method: 'GET',
			headers: Object.complete(request.headers.toJSON(), headers),
			body: body
		});

		return this.fetchHttpRequest(httpRequest);
	},

	/*
	live example (only to create, updating need the SHA, this you should use a PUT request
	author & committer are optional
	var giturl = 'https://api.github.com/repos/dmail/argv/contents/test.js';
	var xhr = new XMLHttpRequest();

	xhr.open('PUT', giturl);
	xhr.setRequestHeader('Authorization', 'token 0b6d30a35dd7eac332909186379673b56e1f03c2');
	xhr.setRequestHeader('content-type', 'application/json');
	xhr.send(JSON.stringify({
		message: 'create test.js',
		content: btoa('Hello world'),
		branch: 'master'
	}));
	*/
	post(request){
		var data = this.parseURL(request.url);
		var giturl = replace('https://api.github.com/repos/{user}/{repo}/contents/{path}', data);
		var headers = data.headers;
		var body = rest.createBody();

		// tell content type is json
		headers['content-type'] = 'application/json';

		// transform the body
		request.body.readAsString().then(function(text){
			body.write(JSON.stringify({
				message: 'update ' + giturl.pathname,
				content: Base64.encode(text)
			}));
			body.close();
		}, body.error);

		// perform the httpRequest
		var httpRequest = this.createHttpRequest({
			method: 'PUT',
			url: giturl,
			headers: Object.complete(request.headers.toJSON(), headers),
			body: body
		});

		return this.fetchHttpRequest(httpRequest);
	},

	match(request){
		return request.url.protocol === 'file-github:';
	},

	methods: {
		get(request){
			return this.get(request);
		},

		post(request){
			return this.post(request);
		}
	}
});

export default githubFileService;