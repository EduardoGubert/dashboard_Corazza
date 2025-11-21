const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dashboard Corazza - Auth API',
      version: '1.0.0',
      description: 'API de autenticação para o Dashboard Corazza com gestão de usuários (Admin/Corretor)',
      contact: {
        name: 'Dashboard Corazza',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID do usuário',
              example: 1,
            },
            username: {
              type: 'string',
              description: 'Nome de usuário',
              example: 'admin',
            },
            role: {
              type: 'string',
              enum: ['admin', 'corretor'],
              description: 'Perfil do usuário',
              example: 'admin',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Nome de usuário',
              example: 'admin',
            },
            password: {
              type: 'string',
              description: 'Senha',
              example: 'admin123',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'Token JWT',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'password', 'role'],
          properties: {
            username: {
              type: 'string',
              description: 'Nome de usuário (único)',
              example: 'corretor01',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Senha (mínimo 6 caracteres)',
              example: 'senha123',
            },
            role: {
              type: 'string',
              enum: ['admin', 'corretor'],
              description: 'Perfil do usuário',
              example: 'corretor',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Caminho para os arquivos com anotações
};

module.exports = swaggerJsdoc(options);