routesApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  	$urlRouterProvider.otherwise('/payment');

	$stateProvider
		.state('checkout', {
			url: '/payment',
			templateUrl: 'app/components/checkout/checkout.html',
			controller: 'checkoutController'			
		})
		.state('shippingDetails', {
			url: '/shipping',
			templateUrl: 'app/components/shipping/shipping-details.html',
			controller: 'shippingController'
		})
		.state('addAddress', {
			url: '/add-address',
			templateUrl: 'app/components/shipping/add-address.html',
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
			controller: 'paymentController'		
		})
		.state('loading', {
			templateUrl: 'app/components/payment/loading.html',
			controller: 'loadingController'
		});
});