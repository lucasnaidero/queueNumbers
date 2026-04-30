import express from "express";
import swaggerUi from "swagger-ui-express";

const app = express();
app.use(express.json());

let queue = [];

// ---------------------
// OPENAPI MANUALE (ROBUSTO)
// ---------------------
const swaggerSpec = {
    openapi: "3.0.0",
    info: {
        title: "Queue API",
        version: "1.0.0",
        description: "API per gestione coda numerica"
    },
    servers: [
        {
            url: process.env.BASE_URL || "http://localhost:3000"
        }
    ],
    paths: {
        "/enqueue": {
            post: {
                summary: "Inserisce un numero in coda",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["number"],
                                properties: {
                                    number: { type: "number", example: 42 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "OK"
                    },
                    400: {
                        description: "Input non valido"
                    }
                }
            }
        },

        "/queue": {
            get: {
                summary: "Ottiene la coda",
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { type: "number" }
                                }
                            }
                        }
                    }
                }
            },
            delete: {
                summary: "Svuota la coda",
                responses: {
                    200: {
                        description: "OK"
                    }
                }
            }
        }
    }
};

// ---------------------
// DOCS
// ---------------------
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/openapi.json", (req, res) => {
    res.json(swaggerSpec);
});

// ---------------------
// ENDPOINTS
// ---------------------
app.post("/enqueue", (req, res) => {
    const { number } = req.body;

    if (typeof number !== "number") {
        return res.status(400).json({ error: "Devi fornire un numero valido" });
    }

    queue.push(number);

    if (queue.length > 10) queue.shift();

    res.json({ message: "Numero aggiunto", queue });
});

app.get("/queue", (req, res) => {
    res.json(queue);
});

app.delete("/queue", (req, res) => {
    queue = [];
    res.json({ message: "Coda svuotata" });
});

app.listen(3000, () => {
    console.log("Server avviato");
});
