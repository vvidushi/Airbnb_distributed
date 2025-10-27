const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Airbnb API',
            version: '1.0.0',
            description: 'API documentation for Airbnb prototype',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5001}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                sessionAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'airbnb_session'
                }
            }
        }
    },
    apis: ['./src/routes/*.js'],//Only paths matching ./src/routes/*.js are scanned.

};

const swaggerSpec = swaggerJsdoc(options);//Library scans those files and extracts @swagger comments


module.exports = swaggerSpec;

