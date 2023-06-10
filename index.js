const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const postRoute = require("./routes/post");
const fileRoute = require("./routes/file");
const chatRoute = require("./routes/chat");
const messageRoute = require("./routes/message");
const groupRoute = require("./routes/group");
const postGroup = require("./routes/postGroup");
dotenv.config();



mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('CONNECTED TO MONGO DB!'));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
    bodyParser.urlencoded({
      limit: "50mb",
      extended: true,
      parameterLimit: 50000,
    })
);  
app.use(cors());
app.use(cookieParser());
// app.use(express.json());

//ROUTES
app.get("/v1/", (req,res)=>{
  res.send("Hello world");
});
app.use("/v1/auth", authRoute);
app.use("/v1/user", userRoute);
app.use("/v1/post", postRoute);
app.use("/v1/file", fileRoute);
app.use("/v1/chat", chatRoute);
app.use("/v1/message", messageRoute);
app.use("/v1/group", groupRoute);
app.use("/v1/postGroup", postGroup);

app.listen(8000, () => {
    console.log("Server is running");
  });