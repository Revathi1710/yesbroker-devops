const dotenv = require("dotenv");
const { connectDb } = require("./db/connectDb");
const app = require("./app");

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDb()
    .then(() => {
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is running on port ${PORT} ✅`);
        });
    })
    .catch((err) => {
        console.error(
            "Database connection failed. Server not started:",
            err
        );
    });