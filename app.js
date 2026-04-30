const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Coda in memoria
let queue = [];

/**
 * 1. Inserire un numero in coda
 */
app.post('/enqueue', (req, res) => {
    const { number } = req.body;

    if (typeof number !== 'number') {
        return res.status(400).json({ error: 'Devi fornire un numero valido' });
    }

    queue.push(number);

    // Mantieni solo gli ultimi 10
    if (queue.length > 10) {
        queue.shift();
    }

    res.json({
        message: 'Numero aggiunto',
        queue
    });
});

/**
 * 2. Ottenere tutti i numeri in coda
 */
app.get('/queue', (req, res) => {
    res.json(queue);
});

/**
 * 3. Pulire la coda
 */
app.delete('/queue', (req, res) => {
    queue = [];
    res.json({ message: 'Coda svuotata' });
});

app.listen(PORT, () => {
    console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
