require.config({
	baseUrl: '/src',
	paths: {
		'mout': '../../bower_components/mout/src',
		'lavaca': '../../bower_components/lavaca/src',
		'Benchmark': '../../bower_components/benchmark/benchmark'
	},
	waitSeconds: 0
});

define('$', function() {
	return window.$;
});

define('jquery', function() {
	return window.$;
});
