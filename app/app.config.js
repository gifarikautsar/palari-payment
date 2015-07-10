paymentApp.config(['KeepaliveProvider', 'IdleProvider', '$sceDelegateProvider', '$httpProvider', '$compileProvider',  function(KeepaliveProvider, IdleProvider, $sceDelegateProvider, $httpProvider, $compileProvider){
	IdleProvider.idle(50 * 60);
	IdleProvider.timeout(1);
	KeepaliveProvider.interval(1);

	$sceDelegateProvider.resourceUrlWhitelist([
		// Allow same origin resource loads.
		'self',
		// Allow loading from our assets domain.  Notice the difference between * and **.
		'https://api.sandbox.veritrans.co.id/v2/**'
	]);

	//disabling debug info
	$compileProvider.debugInfoEnabled(false);
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|bbmmoney):/);
	
	// The blacklist overrides the whitelist so the open redirect here is blocked.
	// $sceDelegateProvider.resourceUrlBlacklist([
	//   'http://myapp.example.com/clickThru**'
	// ]);
	// We need to setup some parameters for http requests
	// These three lines are all you need for CORS support
	// $httpProvider.defaults.useXDomain = true;
	// $httpProvider.defaults.withCredentials = true;
	// delete $httpProvider.defaults.headers.common['X-Requested-With'];
	$httpProvider.defaults.headers.common['Content-Type'] = 'application/json';
}]);

paymentApp.run(['$rootScope', 'Idle', '$state', function($rootScope, Idle, $state) {
  	Idle.watch();
	$rootScope.$on('IdleTimeout', function() {
	 	$state.transitionTo('timeout', {arg: 'arg'})   
	 });
}]);