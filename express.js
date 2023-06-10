require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const port = 100;
const { Pool } = require('pg');

const pool = new Pool({
    database: "jobs",
    user: "postgres",
    password: `${process.env.NEXT_PUBLIC_DB_PASSWORD}`,
    host: `${process.env.NEXT_PUBLIC_DB_HOST}`,
    port: 5432
});

app.use(cors());
app.use(express.json());

app.get('/api/all', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 25
        const offset = (page - 1) * limit
        const client = await pool.connect();
        // const result = await client.query("SELECT * FROM job_posts")
         const result = await client.query(
            `SELECT * FROM job_posts ORDER BY id ASC LIMIT ${limit} OFFSET ${offset}`
        )
        // // /   const result = await client.query('SELECT * FROM posts WHERE post_date >= NOW() - INTERVAL \'1 day\'');
        res.json(result.rows);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.get('/api/:country', async (req, res) => {
    const { country } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 25;
    const offset = (page - 1) * limit;
    
    try {
        const client = await pool.connect();
        const result = await client.query(
            `SELECT * FROM job_posts WHERE country = $1 ORDER BY id ASC LIMIT ${limit} OFFSET ${offset}`,
            [country]
        );
        res.json(result.rows);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.get('/api/all_number', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT COUNT(*) FROM job_posts");
        res.json(result.rows[0].count);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.get('/api/all_number/:country', async (req, res) => {
    const { country } = req.params;
    try {
        const client = await pool.connect();
        const result = await client.query(
            `SELECT COUNT(*) FROM job_posts WHERE country = $1`, 
            [country]
        );
        res.json(result.rows[0].count);
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.get('/working', (req, res) => {
    res.send('yes, I am working');
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});