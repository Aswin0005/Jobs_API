require('dotenv').config();
require('express-async-errors');
//Extra security package
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

//Swagger
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')

const express = require('express');
const app = express();

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// extra packages

//Connect Db
const connectDb = require('./db/connect');
const authentication = require('./middleware/authentication');
// routes
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

app.set('trust proxy',1)
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocument))
app.get('/',(req,res) => {
  res.send('<h1>Jobs Api</h1><a href="/api-docs">Documentation</a1>')
})

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authentication, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDb(process.env.MANGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
