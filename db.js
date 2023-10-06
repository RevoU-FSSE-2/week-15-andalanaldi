const mysql = require('mysql2');

const mysqlCon = mysql.createConnection({
    host: '0.0.0.0', 
    port: 3000,
    user: 'root',
    password: 'RevoUmysql123',
    database: 'revou'
});

mysqlCon.connect((err) => {
  if (err) throw err;
  console.log('MySQL successfully connected');
});

module.exports = mysqlCon;
