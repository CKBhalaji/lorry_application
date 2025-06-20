import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost', // Replace with your MySQL host
  user: 'root', // Replace with your MySQL username
  password: '2003', // Replace with your MySQL password
  database: 'lorry_app', // Replace with your database name
});

export default pool;