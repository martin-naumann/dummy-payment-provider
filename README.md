# Dummy Payment Provider for mozPay
##Step 1: Install the app
In the root directory of this repository, run the following commands:

    $ npm install
    $ node app
and visit [http://localhost:8000](http://localhost:8000) in your browser. If you see the Express welcome page, you're ready to rumble.

##Step 2: Whitelist the provider on your FirefoxOS device
* Preferences on device at /system/b2g/defaults/pref/user.js
* Read with ``adb shell "cat /system/b2g/defaults/pref/user.js"``
* See [this file](https://github.com/mozilla/webpay/blob/master/ezboot/custom-prefs.js) for example configurations
* ``adb pull /system/b2g/defaults/pref/user.js user.js``
* Add your settings to the file (see below)
* ``adb remount && adb push user.js /system/b2g/defaults/pref/user.js && adb sync``
* Reboot the phone

Add the following lines to your user.js:

    user.js:

    pref("dom.payment.skipHTTPSCheck", true);
    pref("dom.payment.provider.1.name", "Dummy");
    pref("dom.payment.provider.1.description", "Dummy Payments");
    pref("dom.payment.provider.1.uri", "http://YOUR_URL/pay?req=");
    pref("dom.payment.provider.1.type", "dummy/payments/pay/v1");
    pref("dom.payment.provider.1.requestMethod", "GET");
Make sure you substitute ``YOUR_URL`` with the actual URL of your server (e.g. "192.168.1.123:8000" if you run it on your computer on port 8000)

##Step 3: Setup the example shop with your new provider

Clone [the mozpay-catalog example](https://github.com) and set it up:

    $ npm install
    $ cp settings.dist.js settings.js
and then edit the ``settings.js`` file like this:

    config.mozPayKey = "demoShop";
    config.mozPaySecret = "secret123";
    config.mozPayAudience = "Dummy";
    config.mozPayType = "dummy/payments/pay/v1";

There's two important bits:

1. the ``mozPayType`` to tell the shop to use our payment provider.
2. the ``mozPaySecret`` that is used to sign the JWTs we're gonna exchange.

The other settings, such as ``mozPayAudience`` and ``mozPayKey`` are also important as they're going to be used with *real* providers (e.g. the secret is bound to the PayKey on a real provider rather than just a global, shared secret.)

Run the shop app with

    $ VCAP_APP_PORT=8080 node server.js
and you should see the shop at [http://localhost:8080](http://localhost:8080)

##Step 4: Make a transaction
Now we're set up to do a test already. Start the Mozpay-Catalog by running

    $ node server
in the root directory of the repository and start our payment provider by running

    $ node app
in the root directory of the payment provider.
Now you can use your Firefox OS device to access the mozpay-catalog at URL it is run to "buy" a piece of cheese or a Kiwi. You'll see the transaction happening on the payment provider server as well as on the shop applications server logs:

    POST /mozpay/postback 200 4ms - 12
    postback received for webpay: 1234
    transaction completed: 53de3763-259c-48bb-8cd1-99fbe84c5aad

and the payment provider will have the JWT of the purchase on the logs:

    null
    ------
    { iss: 'demoShop',
      aud: 'Dummy Payments',
      typ: 'dummy/payments/pay/v1',
      iat: 1374231862,
      exp: 1374235462,
      request:
       { name: 'Magic Cheese',
         description: 'A majestic wedge of swiss cheese',
         icons:
          { '32': 'http://0.0.0.0:8080/img/cheese_32.png',
            '48': 'http://0.0.0.0:8080/img/cheese_48.png',
            '64': 'http://0.0.0.0:8080/img/cheese_64.png',
            '128': 'http://0.0.0.0:8080/img/cheese_128.png' },
         pricePoint: 10,
         id: '2',
         productData: 'localTransID=53de3763-259c-48bb-8cd1-99fbe84c5aad',
         postbackURL: 'http://0.0.0.0:8080/mozpay/postback',
         chargebackURL: 'http://0.0.0.0:8080/mozpay/chargeback',
         simulate: { result: 'postback' } } }

 


