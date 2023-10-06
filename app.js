const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const escapeHtml = require("escape-html");
const app = express();
const { v4: uuidv4 } = require('uuid');
const morgan = require('morgan');
const db = require('./db'); // Import the MySQL database connection

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


// db
// const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Define your common response function
const commonResponse = function (data, error) {
  if (error) {
    return {
      success: false,
      error: error,
    };
  }

  return {
    success: true,
    data: data,
    error: error,
  };
};

// API endpoint for fetching all users
app.get('/users', (req, res) => {
  db.query('SELECT * FROM revou.user', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json(commonResponse(null, 'Server error'));
      return;
    }

    res.status(200).json(commonResponse(result, null));
  });
});

// API endpoint for fetching a user by ID
app.get('/users/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await db.promise().query(
      `SELECT
        u.id,
        u.name,
        u.address,
        SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS total_expense
      FROM
        revou.client AS u
        LEFT JOIN revou.transaction AS t ON u.id = t.user_id
      WHERE
        u.id = ?
      GROUP BY
        u.id`,
      id
    );

    if (rows.length === 0) {
      res.status(404).json(commonResponse(null, 'User not found'));
      return;
    }

    const user = {
      ...rows[0],
      balance: rows[0].total_income - rows[0].total_expense,
    };

    res.status(200).json(commonResponse(user, null));
  } catch (err) {
    console.log(err);
    res.status(500).json(commonResponse(null, 'Server error'));
  }
});

// Define the CORS options for Client X
const clientXCorsOptions = {
  origin: 'http://localhost:7000',
  methods: 'GET,POST', // Allow the necessary HTTP methods
};

// Define the CORS options for Client Y
const clientYCorsOptions = {
  origin: 'http://localhost:8000',
  methods: 'GET,POST', // Allow the necessary HTTP methods
};

// Enable CORS for both clients
app.use('/client-x', cors(clientXCorsOptions));
app.use('/client-y', cors(clientYCorsOptions));

// Additional API endpoints for transactions, as needed

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});