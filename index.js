require('dotenv').config();

const express = require('express');
const cors = require('cors');

const router = require('./router');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', router);

// 404 handler
app.use('*', (req, res, next) => {
  next({ errMsg: 'API_NOT_FOUND', status: 404 });
});

// error handler
app.use((err, req, res, next) => {
  if (!err.status) {
    console.error(err);
    process.exit(0);
  }
  res.status(err.status).json({ message: err.errMsg, status: err.status });
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(0);
})
