
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , jwt = require('jsonwebtoken')
  , needle = require('needle');

var app = express();

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

/**
* This is where the magic happens!
**/
app.get('/pay', function(req,res) {
  console.log(req.query.req); //So that's our JWT (still encoded)
  jwt.verify(req.query.req, "secret123", function(err, decoded) {
    console.log(err);
    console.log("------");
    console.log(decoded); //There's all the fun laid out in front of us
    var responseToken = jwt.sign({
      iss: "Dummy Payments", //That's us (the provider)
      aud: decoded.iss, //The "Audience" is the issuer of the JWT we got
      typ: "dummy/payments/pay/postback/v1",
      exp: ((new Date().getTime() / 1000) + 300), //This token will expire in 5 minutes
      iat: (new Date().getTime() / 1000), //This token was issued right now, duh!
      request: decoded.request, 
      response: {
        "transactionID": "webpay: 1234" //This should really be a unique Transaction ID the provider (we) uses to identify this particular transaction.
      }
    }, "secret123"); //The secret is something we negotiated with the particular shop (in this case: mozpay-catalog)
    needle.post(decoded.request.postbackURL, {
      notice: responseToken
    });
    //Renders a template that calls the paymentSuccess function (check https://developer.mozilla.org/en-US/docs/Web/Apps/Publishing/In-app_payments?redirectlocale=en-US&redirectslug=Apps%2FPublishing%2FIn-app_payments#Processing_postbacks_on_the_server)
    //The actual magic can be seen in public/javascripts/pay.js
    res.render('success'); 
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
