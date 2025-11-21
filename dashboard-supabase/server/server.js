require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { initDatabase, dbRun, dbGet } = require('./database');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Função para criar admin padrão se não existir
const createDefaultAdmin = async () => {
    try {
        // Aguarda um pouco para garantir que o banco foi inicializado
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const existing = await dbGet('SELECT id FROM users WHERE username = ?', ['admin']);
        
        if (!existing) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await dbRun(
                'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                ['admin', hashedPassword, 'Admin']
            );
            console.log('✅ Usuário admin criado automaticamente');
            console.log('📧 Username: admin');
            console.log('🔑 Password: admin123');
            console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
        }
    } catch (error) {
        console.error('Erro ao criar admin padrão:', error);
    }
};

// Inicializar banco de dados
initDatabase();
createDefaultAdmin();

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Dashboard Corazza API"
}));

// Rotas
app.use('/api/auth', authRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
});
