//There was/is a fun bug that causes the mozPaymentProvider's properties to leak into the window object, so we better check where the heck our callback is (mozPaymentProvider.paymentSuccess, where it belongs, or window.paymentSuccess)
var successCallback = ((window.mozPaymentProvider && window.mozPaymentProvider.paymentSuccess) || window.paymentSuccess);
//Yay!
successCallback("GREAT SUCCESS!");
