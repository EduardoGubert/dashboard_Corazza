require('dotenv').config();
const bcrypt = require('bcryptjs');
const { initDatabase, dbRun, dbGet } = require('./database');

// Aguardar um pouco para garantir que o banco foi inicializado
setTimeout(async () => {
    try {
        const username = 'admin';
        const password = 'admin123'; // MUDAR EM PRODUÇÃO!
        const role = 'Admin';

        // Verificar se já existe
        const existing = await dbGet('SELECT id FROM users WHERE username = ?', [username]);

        if (existing) {
            console.log('⚠️  Usuário admin já existe');
            process.exit(0);
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserir
        await dbRun(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );

        console.log('✅ Usuário Admin criado com sucesso!');
        console.log('📧 Username: admin');
        console.log('🔑 Password: admin123');
        console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao criar usuário admin:', error);
        process.exit(1);
    }
}, 1000);

// Inicializar banco
initDatabase();
