const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "DevBoard API",
    description: "Final Project"
  },
  host: "localhost:5173",
  schemes: ["https"]
};

const outputFile = "../swagger.json";
const endpointsFiles = ["./routes/index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
