require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/database");
const seedAdmin = require("./config/adminSeeder");
const initSocket = require("./config/socket");


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    await seedAdmin();

    const server = http.createServer(app);

    // Team Chat (Tier B-3) real-time transport
    initSocket(server, app);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.log(error);
  }
};

startServer();