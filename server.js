const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('.')); // Sirve el archivo index.html

const DB_FILE = './ventas.json';

// Ruta para obtener las ventas
app.get('/api/ventas', (req, res) => {
    const data = fs.readFileSync(DB_FILE);
    res.json(JSON.parse(data));
});

// Ruta para guardar una venta
app.post('/api/ventas', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    const nuevaVenta = {
        id: Date.now(),
        ...req.body,
        fecha: new Date().toLocaleString()
    };
    data.push(nuevaVenta);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    res.status(201).json(nuevaVenta);
});

// Ruta para actualizar el estado de pago de la comisión
app.patch('/api/ventas/:id', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    const index = data.findIndex(v => v.id == req.params.id);
    
    if (index !== -1) {
        data[index].comisionPagada = req.body.comisionPagada;
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        res.json(data[index]);
    } else {
        res.status(404).send('Venta no encontrada');
    }
});

app.delete('/api/ventas/:id', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    const nuevosDatos = data.filter(v => v.id != req.params.id);
    fs.writeFileSync(DB_FILE, JSON.stringify(nuevosDatos, null, 2));
    res.sendStatus(204);
});

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));