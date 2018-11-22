// Include the AWS X-Ray SDK
var XRay = require('aws-xray-sdk');
// Capture calls to the AWS SDK
var AWS = XRay.captureAWS(require('aws-sdk'));
// Capture http traffic
var http = XRay.captureHTTPs(require('http'));

var express = require('express');
var bodyParser = require('body-parser');

// Set region for AWS SDKs
AWS.config.region = process.env.REGION

// Configure sampling rules
XRay.middleware.setSamplingRules('sampling-rules.json');

var app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({extended:false}));

//Start X-ray segment myfrontend
app.use(XRay.express.openSegment('myfrontend'));

app.get('/', function(req, res) {
    // Start X-ray subsegment 'Page Render'
    XRay.captureAsyncFunc('Page Render', function(seg) {
      res.render('index', {
        title: 'BackSpace Academy and AWS X-Ray'
      });
      seg.close(); // Close X-ray subsegment 'Page Render'
    });
    res.status(200).end();
});

//Close X-ray segment myfrontend
app.use(XRay.express.closeSegment());

var port = process.env.PORT || 3000;

var server = app.listen(port, function () {
    console.log('Server running at http://127.0.0.1:' + port + '/');
});
