const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load Swagger documentation
const swaggerDocument = YAML.load(path.join(__dirname, '../../swagger-complete.yaml'));

// Swagger UI options
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { 
      display: none 
    }
    .swagger-ui .info .title {
      color: #2c3e50;
      font-size: 2.5rem;
    }
    .swagger-ui .info .description {
      font-size: 1.1rem;
      line-height: 1.6;
    }
    .swagger-ui .scheme-container {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
    }
  `,
  customSiteTitle: 'Hexa Crochet API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
};

// Swagger UI middleware
const swaggerMiddleware = swaggerUi.serve;
const swaggerSetup = swaggerUi.setup(swaggerDocument, swaggerOptions);

module.exports = {
  swaggerMiddleware,
  swaggerSetup,
  swaggerDocument
};
