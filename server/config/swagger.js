const swaggerAutogen = require('swagger-autogen')({
    openapi: '3.0.0',
    autoHeaders: true,
    autoQuery: true,
    autoBody: true
});

const doc = {
    info: {
        version: '1.0.0',
        title: 'DevBoard API',
        description: 'Project Management API Documentation',
        contact: {
            name: 'API Support',
            email: 'support@devboard.com'
        }
    },
    host: 'localhost:5173',
    basePath: '/',
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
        {
            name: 'Boards',
            description: 'Board management endpoints'
        }
    ],
    securityDefinitions: {
        BearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'JWT token for authentication (Format: Bearer <token>)'
        }
    },
    definitions: {
        // Add your schema definitions here if needed
    }
};

const outputFile = '../swagger.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
