const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbRun, dbGet, dbAll } = require('../database');
const { isAuth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login - Login de usuário
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username e password são obrigatórios' });
        }

        // Buscar usuário
        const user = await dbGet('SELECT * FROM users WHERE username = ?', [username]);

        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Verificar senha
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST /api/auth/register - Cadastrar novo usuário (Apenas Admin)
router.post('/register', isAuth, isAdmin, async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Username, password e role são obrigatórios' });
        }

        if (!['Admin', 'Corretor'].includes(role)) {
            return res.status(400).json({ error: 'Role deve ser Admin ou Corretor' });
        }

        // Verificar se username já existe
        const existingUser = await dbGet('SELECT id FROM users WHERE username = ?', [username]);

        if (existingUser) {
            return res.status(400).json({ error: 'Username já cadastrado' });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserir usuário
        const result = await dbRun(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            user: {
                id: result.lastID,
                username,
                role
            }
        });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// GET /api/auth/me - Obter dados do usuário autenticado
router.get('/me', isAuth, async (req, res) => {
    try {
        const user = await dbGet(
            'SELECT id, username, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// GET /api/auth/users - Listar todos os usuários (Apenas Admin)
router.get('/users', isAuth, isAdmin, async (req, res) => {
    try {
        const users = await dbAll(
            'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
        );

        res.json(users);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// DELETE /api/auth/users/:id - Deletar usuário (Apenas Admin)
router.delete('/users/:id', isAuth, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Não permitir deletar a si mesmo
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'Você não pode deletar seu próprio usuário' });
        }

        const result = await dbRun('DELETE FROM users WHERE id = ?', [id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
