const express = require('express');
const applyMiddleware = require('./middleware');
const cors = require('cors');

const app = express();
const OptionsReacApp = {
  origin: 'http://localhost:3001',
}
app.use(cors(OptionsReacApp));

// applyMiddleware(app);
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/api/user', (req, res) => {
  res.send({
    name: 'John Doe',
    age: 30,
  }
  );
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
