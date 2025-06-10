import pool from './db.js';

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL!');
    connection.release();
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
  }
})();