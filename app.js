const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const escapeHtml = require("escape-html");
const app = express();
const { v4: uuidv4 } = require('uuid');
const morgan = require('morgan');

app.use(bodyParser.urlencoded({ extended: true }));
// helmet
app.use(helmet());
app.use(helmet.frameguard({ action: 'deny' }))
const GlobalcorsOptions = {
  origin: ['http://localhost:7000', 'http://localhost:8000', 'http://localhost:5555'],
}
const allowAllOptions = {
  origin: "*",
}
app.use(express.json());
const ClientXoptions = {
  origin: 'http://localhost:7000',
  methods: 'GET',
}
const ClientYoptions = {
  origin: 'http://localhost:8000',
  methods: ['GET', 'POST'],

}




const requestIdMiddleware = (req, res, next) => {
  if (req.headers['x-request-id']) {
    res.setHeader("x-request-id", req.headers['x-request-id'])
    req.request_id = req.headers['x-request-id']
  } else {
    const uuid = uuidv4()
    res.setHeader("x-request-id", uuid)
    req.request_id = uuid
  }
  next()
}

const logggerMiddleware = (req, res, next) => {
  console.log(req.request_id)
  next()
}
app.get('/sensitive-data', (req, res) => {
  let query = "SELECT * FROM users WHERE username = " + req.query.username;
  res.send(query);
});

app.get('/click-jacking', (req, res) => {
  res.send(`
     <form action="/click-jacking" method="post">
       <label for="username">Username:</label><br>
       <input type="text" id="username" name="username"><br>
       <label for="password">Password:</label><br>
       <input type="password" id="password" name="password"><br>
       <input type="submit" value="Submit">
     </form>
   `);
});
app.post('/click-jacking', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  res.json({ username: username, password: password });
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.get('/request', requestIdMiddleware, (req, res) => {
  console.log(req.headers)
  res.send('Hello World!');
});
app.get("/xss", (req, res) => {
  const name = req.query.name;
  res.send(`<h1>Hello, ${name}</h1>`);
});

app.get('/sample-header', (req, res) => {
  if (req.header('Accept').includes('text/html')) {
    res.setHeader('Content-Type', 'text/html');
    res.send('<h1 style="color: red;">Hello World!</h1>');
  } else if (req.header('Accept').includes('application/json')) {
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'Hello World!' });
  } else {
    res.send('Hello World!');
  }
});











// app.use(morgan('combined'));

app.get('/cors', (req, res) => {
  res.json({ message: 'This is a CORS-enabled route global' });
});

app.get('/client-x', cors(ClientXoptions), (req, res) => {
  // LOGIC BUSINESS
  res.json({ message: 'This is a CORS-enabled X-client route' });
});
app.options('/client-x', cors(), (req, res) => {

});
app.post('/client-x', cors(ClientXoptions), (req, res) => {
  let body = req.body;
  res.json({ message: body });
})
app.get('/client-y', cors(ClientYoptions), (req, res) => {
  res.json({ message: 'This is a CORS-enabled y-client route' });
});
app.post('/client-y', cors(ClientYoptions), (req, res) => {
  let body = req.body;
  res.json({ message: body });
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


