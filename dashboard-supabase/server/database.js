const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Criar conexão com SQLite
const dbPath = path.join(__dirname, 'auth.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco:', err);
    } else {
        console.log('✅ Conectado ao banco SQLite');
    }
});

// Criar tabela de usuários
const createUsersTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('Admin', 'Corretor')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.run(sql, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela:', err);
        } else {
            console.log('✅ Tabela users criada/verificada');
        }
    });
};

// Inicializar banco
const initDatabase = () => {
    createUsersTable();
};

// Promisify para facilitar uso com async/await
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

module.exports = { db, initDatabase, dbRun, dbGet, dbAll };
