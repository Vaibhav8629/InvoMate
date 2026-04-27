const express = require("express");
const router = require("./routes/router");
const connectDB = require("./utils/db");
const cors = require("cors");
require("dotenv").config();
const reportRoutes = require("./routes/reports");
const aiRoutes = require("./routes/aiDashboardRoutes");
const signatureRoutes = require('./routes/signature');
const app = express();

const corsOptions = {
    origin: "http://localhost:5173",
    methods: "GET, POST , PUT, DELETE, PATCH",
    credentials: true,
}

app.use(cors(corsOptions));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use("/api/ai", aiRoutes);
app.use("/api/auth", router);
app.use('/api/reports', reportRoutes);
app.use('/api/signature', signatureRoutes);

const PORT = process.env.PORT;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running at PORT ${PORT}`);
    })
});