require("dotenv").config()
const express = require("express");
const app = express();
const path = require("path")
const cors = require("cors")
const mongoose = require("mongoose")
const fileUpload = require("express-fileupload")
const DB_MONGODB_URL  = process.env.DB_MONGODB_URL



const swaggerUI = require("swagger-ui-express");
const Yaml = require("yamljs")
const SwaggerDoc  = Yaml.load("./documentation/api.yaml")
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(SwaggerDoc))


mongoose.connect(DB_MONGODB_URL);

let PORT = process.env.PORT || 5000



require('./models/users')
require('./models/superAdmin')
require('./models/courses')
require('./models/courseLesson')
require('./models/courseComment')
require('./models/courseBooks')

app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname, "CourseFile")))
app.use(fileUpload({}))
app.use(require('./routes/auth'))
app.use(require('./routes/superAdmin'))
app.use(require('./routes/adminCourse'))
app.use(require('./routes/courseLesson'))
app.use(require('./routes/courseComment'))
app.use(require('./routes/userStudend'))




app.listen(PORT, () => {
    console.log("SERVER ON PORT LISTEN " + PORT)
})

// const swaggerJsDoc = require("swagger-jsdoc");

// const SwaggerDoc = require("./documentation/SwaggerDoc")

/* const swaggerSpec = swaggerJsDoc(SwaggerDoc)
app.use("/api-docs",swaggerUI.serve, swaggerUI.setup(swaggerSpec)) */