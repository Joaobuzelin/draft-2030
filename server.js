const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o MySQL adaptada para variáveis de ambiente (Aiven/Render)
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hs_recruiting',
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false // Ativa SSL apenas quando estiver na nuvem
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar no MySQL:', err);
        return;
    }
    console.log('Conectado ao MySQL com sucesso!');
});

// Rota para buscar os recrutas ordenados pelo ranking
app.get('/api/players', (req, res) => {
    const sql = `
        SELECT p.*, c.name_college AS college_committed, c.logo_url AS college_logo 
        FROM players p 
        LEFT JOIN colleges c ON p.college_id = c.id 
        ORDER BY p.rank_position ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar recrutas:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Rota para buscar jogadores por ano de classe
app.get('/api/players/class/:year', (req, res) => {
    const classYear = req.params.year;
    const sql = 'SELECT * FROM players WHERE class_year = ? ORDER BY rank_position ASC';
    
    db.query(sql, [classYear], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Rota POST para cadastrar um novo recruta
app.post('/api/players', (req, res) => {
    const { 
        rank_position, name_player, position_player, height, 
        weight_lbs, high_school, hometown, stars, grade, 
        class_year, college_id, commit_date 
    } = req.body;

    const sql = `
        INSERT INTO players 
        (rank_position, name_player, position_player, height, weight_lbs, high_school, hometown, stars, grade, class_year, college_id, commit_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [rank_position, name_player, position_player, height, weight_lbs, high_school, hometown, stars, grade, class_year, college_id, commit_date], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Jogador cadastrado com sucesso!', id: result.insertId });
    });
});

// Porta dinâmica para o Render (com fallback para 3000 localmente)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});