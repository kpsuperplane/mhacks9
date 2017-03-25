
wolframRequest = (query, callback) => {
	request.get("http://api.wolframalpha.com/v2/query")
		.query({
			appid: "WPHVGV-P8YW5TGLQX",
			input: query,
			output: json
		})
		.end(callback);
}

