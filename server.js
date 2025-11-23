const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketIo = require("socket.io");
const io = socketIo(server, {
  cors: { origin: "*" },
});
require("dotenv").config();

// Database configuration
const dbconfig = require("./db"); // Ensure your DB connection is properly set up

// Import routes
const roomsRoute = require("./routes/roomsRoute");
const usersRoute = require("./routes/usersRoute");
const bookingsRoute = require("./routes/bookingsRoute");
const paymentRoute = require("./routes/paymentRoutes"); // Khalti routes
const esewaRoutes = require("./routes/esewaRoutes"); // eSewa routes
const stripeRoute = require("./routes/stripeRoute");
const kycRoute = require("./routes/kycRoute");
const chatRoutes = require("./routes/chatRoutes"); // Chat routes
const reviewRoutes = require("./routes/reviewRoutes")


// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://avas-frontend.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());


// Routes
app.use("/api/rooms", roomsRoute);
app.use("/api/users", usersRoute);
app.use("/api/bookings", bookingsRoute);
app.use("/api/payments", paymentRoute); // Khalti payments
app.use("/api/esewa", esewaRoutes); // eSewa payments
app.use("/api/stripe", stripeRoute);
app.use("/uploads", express.static("uploads"));
app.use("/api/kyc", kycRoute);
app.use("/api/chat", chatRoutes); // Chat routes
app.use("/api/reviews", reviewRoutes);

// Socket.io integration for real-time chat
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("sendMessage", (data) => {
    // Emit to both the sender and receiver so that each receives the new message immediately
    io.emit(`receiveMessage-${data.roomid}-${data.receiverId}`, data);
    io.emit(`receiveMessage-${data.roomid}-${data.senderId}`, data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
