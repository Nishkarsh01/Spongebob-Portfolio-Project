//req packages
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mailgun = require('mailgun-js');
const mongoose = require('mongoose');
require('dotenv').config();

//setting app to use express
const app = express();

//setting up the view engine
app.set('view engine', 'ejs');

//setting up the public folder
app.use(express.static('public'));

//allowing app to use bodyparser
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose.connect(
  process.env.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);


/**schema */
const videopost = new mongoose.Schema({
  title: String,
  date: String,
  imgurl: String,
  vurl: String,
  body: String,
});

const vpost = mongoose.model('videopost', videopost);

const imagepost = new mongoose.Schema({
  title: String,
  date: String,
  url: String,
  body: String,
});

const ipost = mongoose.model('imgpost', imagepost);

//get requests
app.get('/', (req, res) => {
  vpost.find({}, function (err, docs1) {
    ipost.find({}, function (err, docs2) {
      res.render('index', {
        postsArray: docs2,
        postsVideoArray: docs1,
      });
    });
  });
});

app.get('/auth', (req, res) => {
  res.render('auth.ejs');
});

//post requests

//contact form post req
app.post('/', (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var subject = req.body.subject;
  var message = req.body.message;

  const DOMAIN = 'YOUR_DOMAIN_NAME';
  const mg = mailgun({
    apiKey: '' + process.env.APIKEY,
    domain: '' + process.env.DOMAIN,
  });
  const data = {
    from: email,
    to: 'rrwebsite20@gmail.com',
    subject: subject,
    text:
      message +
      ' [Sent by: { ' +
      ' Name: ' +
      name +
      ', Subject: ' +
      subject +
      ', Email: ' +
      email +
      ' }]',
  };
  mg.messages().send(data, function (error, body) {
    if (!error) {
      console.log(body);
      if (name === '' || email === '' || subject === '' || message === '') {
        res.render('failed');
      } else {
        res.render('thankyou');
      }
    } else {
      res.render('failed');
    }
  });
});

//composing posts
app.post('/compose', (req, res) => {
  var newImgPostObject = new ipost({
    title: req.body.title,
    date: req.body.date,
    url: req.body.url,
    body: req.body.body,
  });

  newImgPostObject.save();

  res.redirect('/');
});

app.post('/composevideo', (req, res) => {
  const newvideopostObject = new vpost({
    title: req.body.title,
    date: req.body.date,
    imgurl: req.body.imgurl,
    vurl: req.body.vurl,
    body: req.body.body,
  });

  newvideopostObject.save();

  res.redirect('/');
});

app.post('/auth', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.send('Error one of the fields is empty..');
  } else {
    if (
      req.body.email === '' + process.env.EMAIL &&
      req.body.password === '' + process.env.PASSWORD
    ) {
      console.log('success');
      if (req.body.typePost === 'Video') {
        res.render(res.render('composevideo'));
      } else if (req.body.typePost === 'Image') {
        res.render(res.render('compose'));
      } else if (req.body.typePost === 'Delete') {
        vpost.find({}, function (err, docs1) {
          ipost.find({}, function (err, docs2) {
            res.render('deleteposts', {
              postsArray: docs2,
              postsVideoArray: docs1,
            });
          });
        });
      }
    } else {
      res.send('An Error has occured Please Try Again..');
    }
  }
});

app.post('/deleteImagePost', (req, res) => {
  ipost.deleteOne({ title: req.body.checkbox }, function (err) {
    if (err) return handleError(err);
  });
  res.redirect('/');
});

app.post('/deleteVideoPost', (req, res) => {
  vpost.deleteOne({ title: req.body.checkbox }, function (err) {
    if (err) return handleError(err);
  });
  res.redirect('/');
});

//making app to listen to reqs on port 3000 or any port

let port = process.env.PORT;
if (port == null || port == '') {
  port = 3000;
}

app.listen(port, () => {
  console.log('server has started successfully');
});
