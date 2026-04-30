
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const express = require('express');
const app = express();
const PORT = 3000;



const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "1.0.0",
  },
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.js"], // dove hai le tue route
};

const swaggerSpec = swaggerJsdoc(options);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());

// Coda in memoria
let queue = [];

/**
 * @openapi
 * /enqueue:
 *   post:
 *     summary: Inserisce un numero in coda
 *     description: Aggiunge un numero alla queue mantenendo solo gli ultimi 10 elementi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *             properties:
 *               number:
 *                 type: number
 *                 example: 42
 *     responses:
 *       200:
 *         description: Numero aggiunto con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Numero aggiunto
 *                 queue:
 *                   type: array
 *                   items:
 *                     type: number
 *       400:
 *         description: Input non valido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.post('/enqueue', (req, res) => {
    const { number } = req.body;

    if (typeof number !== 'number') {
        return res.status(400).json({ error: 'Devi fornire un numero valido' });
    }

    queue.push(number);

    if (queue.length > 10) {
        queue.shift();
    }

    res.json({
        message: 'Numero aggiunto',
        queue
    });
});

/**
 * @openapi
 * /queue:
 *   get:
 *     summary: Ottiene tutti i numeri in coda
 *     responses:
 *       200:
 *         description: Lista dei numeri
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: number
 */
app.get('/queue', (req, res) => {
    res.json(queue);
});

/**
 * @openapi
 * /queue:
 *   delete:
 *     summary: Svuota la coda
 *     responses:
 *       200:
 *         description: Coda svuotata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Coda svuotata
 */
app.delete('/queue', (req, res) => {
    queue = [];
    res.json({ message: 'Coda svuotata' });
});

app.listen(PORT, () => {
    console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
