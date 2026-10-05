const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const brokerRouter = require("./routes/broker.routes");
const propertyRouter = require("./routes/property.route");
const BannerRouter = require("./routes/banner.routes");
const storyRouter = require("./routes/story.routes");
const adminRouter = require("./routes/admin.routes");
const localityRouter = require("./routes/locality.routes");

dotenv.config();

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://yesbroker2.onrender.com",
        "https://yesbrokerfinal.onrender.com"
    ],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api", brokerRouter);
app.use("/api", propertyRouter);
app.use("/api", storyRouter);
app.use("/api", BannerRouter);
app.use("/api", localityRouter);
app.use("/api", adminRouter);

module.exports = app;