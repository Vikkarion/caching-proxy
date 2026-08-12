// caching proxy
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || undefined;

const app = express();

app.use(cors());

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`));
