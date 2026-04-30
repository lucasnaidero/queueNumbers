import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();

app.use(express.json());

// ---------------------
// STATE
// ---------------------
let queue = [];

// ---------------------
// SWAGGER SETUP (FIXED)
// ---------------------
const PORT = process.env.PORT || 3000;

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Queue API",
            version: "1.0.0",
            description: "API per gestione coda numerica"
        },

        // 🔥 IMPORTANTISSIMO per client .NET (NSwag/AutoRest)
        servers: [
            {
                url: process.env.BASE_URL || `http://localhost:${PORT}`
            }
        ]
    },

    // 🔥 più stabile su Render rispetto a glob generici
    apis: ["./index.js"]
});

// JSON contract endpoint
app.get("/openapi.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

// Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---------------------
// 1. ENQUEUE
// ---------------------
/**
 * @openapi
 * /enqueue:
 *   post:
 *     summary: Inserisce un numero in coda
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [number]
 *             properties:
 *               number:
 *                 type: number
 *                 example: 42
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Input non valido
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

// ---------------------
// 2. GET QUEUE
// ---------------------
/**
 * @openapi
 * /queue:
 *   get:
 *     summary: Ottiene la coda
 *     responses:
 *       200:
 *         description: OK
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
// 3. CLEAR QUEUE
// ---------------------
/**
 * @openapi
 * /queue:
 *   delete:
 *     summary: Svuota la coda
 *     responses:
 *       200:
 *         description: OK
 */
app.delete('/queue', (req, res) => {
    queue = [];
    res.json({ message: 'Coda svuotata' });
});

// ---------------------
// START SERVER
// ---------------------
app.listen(PORT, () => {
    console.log(`Server avviato su porta ${PORT}`);
    console.log(`Docs: /docs`);
    console.log(`OpenAPI: /openapi.json`);
});
