const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const router = require("./routes/router");
const connectDB = require("./utils/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const reportRoutes = require("./routes/reports");
const signatureRoutes = require('./routes/signature');
const notificationRoutes = require('./routes/notificationRoutes');
const testNotificationRoutes = require('./routes/testNotificationRoutes'); // For testing only
const NotificationService = require('./services/notificationService');

const app = express();
const server = http.createServer(app);

const corsOptions = {
    origin: "*",
    methods: "GET, POST , PUT, DELETE, PATCH",
    credentials: true,
}

app.use(cors(corsOptions));

// Parse cookies BEFORE body parsers
app.use(cookieParser());

// Body parsers
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
// Body parsers
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Initialize Socket.io with CORS
const io = new Server(server, {
    cors: corsOptions
});

// Socket.io connection handling
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join user to their personal room for targeted notifications
    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their notification room`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Make io accessible to routes
app.set("io", io);

// Initialize notification service
const notificationService = new NotificationService(io);
app.set("notificationService", notificationService);

// Routes
app.use("/api/auth", router);
app.use('/api/reports', reportRoutes);
app.use('/api/signature', signatureRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/test-notifications', testNotificationRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running at PORT ${PORT}`);
    })
});