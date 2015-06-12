routesApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  	$urlRouterProvider.otherwise('/payment');

	$stateProvider
		.state('checkout', {
			url: '/payment',
			templateUrl: 'app/components/payment/checkout.html',
			controller: 'checkoutController'			
		})
		.state('shippingDetails', {
			url: '/shipping',
			templateUrl: 'app/components/payment/shipping-details.html',
			controller: 'shippingController'
		})
		.state('addAddress', {
			url: '/add-address',
			templateUrl: 'app/components/payment/add-address.html',
			controller: 'addAddressController'
		})
		.state('paymentDetails', {
			url: '/payment-details',
			templateUrl: 'app/components/payment/payment-details.html',
			controller: 'paymentController'
		})
		.state('paymentDetails.creditCard', {
			templateUrl: 'app/components/payment/payment-type/credit-card.html',
			controller: 'creditCardController'
		})
		.state('paymentDetails.bankTransfer', {
			templateUrl: 'app/components/payment/payment-type/bank-transfer.html'
		})	
		.state('paymentDetails.bbmMoney', {
			templateUrl: 'app/components/payment/payment-type/bbm-money.html'
		})	
		.state('paymentFinish', {
			url: '/payment-finish',
			templateUrl: 'app/components/payment/payment-finish.html',
			controller: 'paymentController',
			params: { data: null }		
		})
		.state('loading', {
			templateUrl: 'app/components/payment/loading.html',
			controller: 'loadingController',
			params: { card: null}
		});
});