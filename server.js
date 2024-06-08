const express = require('express');
const bodyParser = require('body-parser');
const admin =require('firebase-admin');
const path= require('path');
const bcrypt=require('bcrypt');
const app= express();
const request=require('request')

const PORT= 3000;

const serviceAccount=require('./key.json');

admin.initializeApp({
    credential:admin.credential.cert(serviceAccount)
});

const db =admin.firestore();

app.set('view engine','ejs');

app.use('/static',express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    res.render('signup');
});

app.get('/signup',(req,res)=>{
    res.render('signup');
});

app.post('/signup',async(req,res)=>{
    const { email, password }=req.body;
    const userDoc = await db.collection('fullstack').doc('email').get();
    if(userDoc.exists){
        return res.status(400).send('Email Already  Exists');
    }
    const hashedPassword = await bcrypt.hash(password,10);
    await db.collection('fullstack').doc(email).set({
        email,
        password : hashedPassword
    });
    res.render('login');
});



app.get('/login',(req,res)=>{
    res.render('login');
});


app.get('/index',(req,res)=>{
  res.render('index');
});


app.post('/validate', (req, res) => {
    var number = req.body.number;
    request.get({
      url: 'https://api.api-ninjas.com/v1/validatephone?number=' + number,
      headers: {
        'X-Api-Key': 'kSZE9cnN0XkC7MHxpVGiBw==BGauYn6F6okGUBbx'
      },
    }, function(error, response, body) {
      if(error) {
        console.error('Request failed:', error);
        res.send('Request failed');
      } else if(response.statusCode != 200) {
        console.error('Error:', response.statusCode, body.toString('utf8'));
        res.send('Error: ' + response.statusCode);
      } else {
        const data = JSON.parse(body);
        console.log(data);
        res.render('dash', { data: data });
      }
    });
  });

app.post('/login',async(req,res)=>{
    const { email, password }=req.body;
    const userDoc = await db.collection('fullstack').doc(email).get();
    if(!userDoc.exists){
        return res.status(400).send('Invalid Email or password');
    }

    const isPasswordValid = await bcrypt.compare(password , userDoc.data().password);
    if(!isPasswordValid){
        return res.status(400).send('Invalid Email or password');
    }
    res.render('index');
});

app.listen(PORT,()=>{
    console.log(`Listening Port http://localhost:${PORT}`);
});