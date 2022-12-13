const Express = require('express');
const ExpressGraphQL = require('express-graphql').graphqlHTTP;
const schema = require("./schema");
const cors = require('cors')
const multer = require("multer");

const app = Express();

const sqlite3 = require('sqlite3').verbose();

//create a database if no exists
const database = new sqlite3.Database("./app.db");

app.use(cors())
app.use("/graphql", ExpressGraphQL({ schema: schema.schema, graphiql: true }));

app.use(Express.static("./public"));


var storage = multer.diskStorage({

    destination: "./public/images",
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

var upload = multer({ storage: storage }).single('file')

app.post('/upload', function (req, res) {

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        return res.status(200).send(req.file)

    })

});


app.listen(3001, () => {
    console.log("GraphQl Server running at 3001");
});
