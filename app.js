import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();

app.use(express.json());

// ---------------------
// STATE (demo queue)
// ---------------------
let queue = [];

// ---------------------
// SWAGGER SETUP
// ---------------------
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Queue API",
            version: "1.0.0",
            description: "API per gestione coda numerica"
        }
    },
    apis: ["./**/*.js"] // puoi restringere a routes file se vuoi
});

app.get("/openapi.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---------------------
// 1. ENQUEUE NUMBER
// ---------------------
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

    // Mantieni solo ultimi 10
    if (queue.length > 10) {
        queue.shift();
    }

    res.json({
        message: 'Numero aggiunto',
        queue
    });
});

// ---------------------
// 2. GET QUEUE
// ---------------------
/**
 * @openapi
 * /queue:
 *   get:
 *     summary: Ottiene tutti i numeri in coda
 *     responses:
 *       200:
 *         description: Lista numerica della coda
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

// ---------------------
// 3. DELETE QUEUE
// ---------------------
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

// ---------------------
// START SERVER
// ---------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server avviato su porta ${PORT}`);
    console.log(`Docs: http://localhost:${PORT}/docs`);
    console.log(`OpenAPI: http://localhost:${PORT}/openapi.json`);
});
