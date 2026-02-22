const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/products', productRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.use(errorMiddleware);

module.exports = app;