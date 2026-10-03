const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o MySQL do WampServer
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Usuário padrão do WampServer
    password: '',      // Senha padrão é vazia no WampServer
    database: 'hs_recruiting'
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
    // A instrução com ORDER BY entra exatamente nesta variável de SQL:
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

// Rota para buscar jogadores por ano de classe (ex: /api/players/class/2025)
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});