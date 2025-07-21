const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    defentitions: {
        openapi: '3.0.0',
        info: {
            title: 'DevBoard API',
            version: '1.0.0',
            description: 'A development board task manager API.',
            license: {
                name: 'MIT'
            },
            externalDocs: {
                description: 'Find more info on GitHub',
                url: 'https://github.com/Amproids/DevBoard'
            }
        }
    }
};
