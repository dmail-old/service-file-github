/* global platform */

import getGithub from './lib/get.js';
import postGithub from './lib/post.js';

import rest from './node_modules/@dmail/rest/index.js';

var githubFileService = rest.createService({
	name: 'file-github',

	handleRequest(request){
		if( request.url.protocol === 'file-github://' ){
			if( request.method === 'GET' ){
				return getGithub(request);
			}
			else if( request.method === 'POST' ){
				return postGithub(request);
			}
		}
	}
});

export default githubFileService;