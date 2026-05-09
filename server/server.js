const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const router = require("./routes/router");
const connectDB = require("./utils/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const reportRoutes = require("./routes/reports");
const signatureRoutes = require("./routes/signature");
const notificationRoutes = require("./routes/notificationRoutes");
const testNotificationRoutes = require("./routes/testNotificationRoutes");
const NotificationService = require("./services/notificationService");

const app = express();
const server = http.createServer(app);


// ===== ERROR HANDLING =====
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
});


// ===== CORS =====
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
};

app.use(cors(corsOptions));


// ===== MIDDLEWARE =====
app.use(cookieParser());

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({
    limit: "100mb",
    extended: true
}));


// ===== SOCKET.IO =====
const io = new Server(server, {
    cors: corsOptions
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});


// ===== APP VARIABLES =====
app.set("io", io);

const notificationService = new NotificationService(io);
app.set("notificationService", notificationService);


// ===== ROUTES =====
app.use("/api/auth", router);
app.use("/api/reports", reportRoutes);
app.use("/api/signature", signatureRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/test-notifications", testNotificationRoutes);


// ===== TEST ROUTE =====
app.get("/", (req, res) => {
    res.send("Backend is running successfully");
});


// ===== PORT =====
const PORT = process.env.PORT || 5000;


// ===== START SERVER =====
const startServer = async () => {
    try {

        await connectDB();
        console.log("MongoDB Connected");

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {

        console.error("Server startup failed:", error);

    }
};

startServer();