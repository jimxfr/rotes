const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

// CONEXIÓN A MONGODB (Pega aquí tu código de conexión de Atlas)
const mongoURI = "mongodb+srv://admin:admin@cluster0.jsrqabx.mongodb.net/?appName=Cluster0"; 
mongoose.connect(mongoURI).then(() => console.log("Conectado a MongoDB")).catch(err => console.log(err));

// DEFINIR EL MODELO DE DATOS (Lo que antes era tu JSON)
const VentaSchema = new mongoose.Schema({
    cliente: String,
    montoTotal: Number,
    costoBase: Number,
    comision: Number,
    tipo: String,
    descripcion: String,
    comisionPagada: { type: Boolean, default: false },
    fecha: { type: String, default: () => new Date().toLocaleString() }
});

const Venta = mongoose.model('Venta', VentaSchema);

// RUTAS API
app.get('/api/ventas', async (req, res) => {
    const ventas = await Venta.find().sort({ _id: -1 });
    res.json(ventas);
});

app.post('/api/ventas', async (req, res) => {
    const nuevaVenta = new Venta(req.body);
    await nuevaVenta.save();
    res.status(201).json(nuevaVenta);
});

app.patch('/api/ventas/:id', async (req, res) => {
    const venta = await Venta.findByIdAndUpdate(req.params.id, { comisionPagada: req.body.comisionPagada }, { new: true });
    res.json(venta);
});

app.delete('/api/ventas/:id', async (req, res) => {
    await Venta.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
});

const fs = require('fs');

// PEGA ESTO JUSTO ANTES DE app.listen(PORT, ...)
app.get('/api/migrar', async (req, res) => {
    try {
        const filePath = './ventas.json';
        if (!fs.existsSync(filePath)) return res.send("No se encontró el archivo ventas.json");

        const rawData = fs.readFileSync(filePath, 'utf8');
        const ventasViejas = JSON.parse(rawData);

        // Mapeamos los datos viejos al formato nuevo de MongoDB
        const ventasAdaptadas = ventasViejas.map(v => ({
            cliente: v.cliente || "Migración Antigua",
            montoTotal: parseFloat(v.montoTotal || v.monto || 0),
            costoBase: parseFloat(v.costoBase || 0),
            comision: parseFloat(v.comision || 0),
            tipo: v.tipo || "Contado",
            descripcion: v.descripcion || "Venta migrada",
            comisionPagada: v.comisionPagada || false,
            fecha: v.fecha || new Date().toLocaleString()
        }));

        await Venta.insertMany(ventasAdaptadas);
        res.send(`✅ Se migraron ${ventasAdaptadas.length} registros con éxito.`);
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
});

app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
