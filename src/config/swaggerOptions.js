import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from "dotenv";

dotenv.config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for HR AI Agent',
    },
    servers: [
      {
        url: process.env.PROD_SERVER,
        description: 'Production Server',
      },
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development Server',
      },
    ],
    tags: [
      {
        name: "Policies",
        description: "Endpoints related to HR policies",
      },
      {
        name: "Logs",
        description: "Endpoints related to crawler logs",
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);
export default specs;
