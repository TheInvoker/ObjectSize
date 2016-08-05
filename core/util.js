module.exports = new function() {

	// check if on mobile
	this.isMobile = function(req) {
		var ua = req.headers['user-agent'];
		return /mobile/i.test(ua);
	};
	
	// handle success
	this.success = function(res, data) {
		res.writeHead(200); 
		res.end(JSON.stringify({
			'status' : 'ok',
			'data' : data
		}));
	};
	
	// handle fail
	this.fail = function(res, data) {
		res.writeHead(200); 
		res.end(JSON.stringify({
			'status' : 'error',
			'data' : data
		}));
	};
};