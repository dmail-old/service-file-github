import rest from '../node_modules/rest/index.js';
import httpService from '../node_modules/service-http/index.js';

import replace from './replace.js';
import Base64 from './base64.js';

/*
live example (only to create, updating need the SHA)
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
// https://developer.github.com/v3/repos/contents/#create-a-file
// http://stackoverflow.com/questions/26203603/how-do-i-get-the-sha-parameter-from-github-api-without-downloading-the-whole-f
// en mode install il suffit de faire un create file avec PUT
// en mode update il faut update le fichier avec un PUT mais c'est plus complexe
function postGithubFile(request){
	var giturl = replace('https://api.github.com/repos/{user}/{repo}/contents/{path}', {

	});

	var headers = {
		'content-type': 'application/json'
	};

	var httpRequest = rest.createRequest({
		url: giturl,
		method: 'PUT',
		// TODO : ceci ne marche pas, il faut transformer
		// le body avec un stream de transformation
		body: JSON.stringify({
			message: 'update ' + giturl.pathname,
			content: Base64.encode(request.body)
		});
	});

	for(var headerName in headers){
		if( false === httpRequest.headers.has(headerName) ){
			httpRequest.headers.set(headerName, headers[headerName]);
		}
	}

	return httpService.handleRequest(httpRequest);
}

export default postGithubFile;