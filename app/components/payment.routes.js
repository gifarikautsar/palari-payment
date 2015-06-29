routesApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

	$stateProvider
		.state('payment', {
			templateUrl: 'app/components/payment/payment.html',
			controller: 'paymentController'
		})
		.state('payment.checkout', {
			url: '/checkout/:productId',
			templateUrl: 'app/components/payment/checkout/checkout.html',
			controller: 'checkoutController'
		})
		.state('payment.shippingDetails', {
			url: '/shipping',
			templateUrl: 'app/components/payment/shipping/shipping-details.html',
			controller: 'shippingController'
		})
		.state('payment.addAddress', {
			url: '/add-address',
			templateUrl: 'app/components/payment/shipping/add-address.html',
			controller: 'addAddressController'
		})
		.state('payment.paymentDetails', {
			url: '/payment-details',
			templateUrl: 'app/components/payment/payment-details/payment-details.html',
			controller: 'paymentDetailsController'
		})
		.state('payment.paymentDetails.creditCard', {
			templateUrl: 'app/components/payment/payment-details/payment-type/credit-card.html',
			controller: 'creditCardController'
		})
		.state('payment.paymentDetails.bankTransfer', {
			templateUrl: 'app/components/payment/payment-details/payment-type/bank-transfer.html',
			controller: 'bankTransferController'
		})
		.state('payment.paymentDetails.bbmMoney', {
			templateUrl: 'app/components/payment/payment-details/payment-type/bbm-money.html'
		})
		.state('payment.paymentFinish', {
			url: '/payment-finish',
			templateUrl: 'app/components/payment/payment-finish/payment-finish.html',
			controller: 'paymentFinishController'
		})
		.state('payment.loading', {
			templateUrl: 'app/components/payment/loading.html',
			controller: 'loadingController',
			params: {
				paymentStatus: null,
				response: null
			}
		})
		.state('404', {
			url: '/404',
			templateUrl: 'app/components/errors/404.html'
		})
		.state('500', {
			url: '/500',
			templateUrl: 'app/components/errors/500.html'
		});

});
