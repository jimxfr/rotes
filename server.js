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

app.get('/ping', (req, res) => {
    res.send('Servidor Activo');
});

app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
