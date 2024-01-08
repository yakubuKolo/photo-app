const express = require('express');
const exphbs  = require('express-handlebars');
const fileupload = require('express-fileupload');
const mysql = require('mysql')

const app = express();
const port = process.env.PORT || 3000;

// Default option
app.use(fileupload());

app.use(express.static('upload'));

// Templating engines
app.engine('hbs', exphbs.engine( {extname: '.hbs'}));
app.set ('view engine', 'hbs');



//db
const pool = mysql.createPool({
    connectionLimit : 100,
    host : "localhost",
    user  : "root",
    password : "1011",
    database : "userprofile"


});



pool.getConnection((err, connection) => {
    if(err) throw err;
    console.log('connected')
});



// Home
app.get('/', (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log('connected')
    
        connection.query("SELECT * FROM user WHERE status = 'main';", (err, rows)=> {
            connection.release();
            if(!err){
                res.render('home', {rows});
            }
        });
    });
});
//add image
app.get('/addimage', (req, res) => {
    res.render('index');

});




app.post('/addimage', (req, res) => {

    let samplefile;
    let uploadpath;


    if(!req.files || Object.keys(req.files).length === 0){
        return res.status(400).send("No files were uploaded", err);
    }
    samplefile = req.files.samplefile;
    const {cat, desc} = req.body;
   uploadpath = __dirname + '/upload/' + samplefile.name;

   console.log(samplefile);

 samplefile.mv(uploadpath, function (err) {
    if (err) return res.status(500).send(err);





    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log('connected')
    
        connection.query('INSERT INTO user SET image = ?, description = ?, cat = ?',[samplefile.name, desc, cat] , (err, rows)=> {
            connection.release();
            if(!err){
                res.redirect('/');
            } else{
                console.log(err)
            }
        });
    });

});

});

app.get('/pictures/:cat', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log('connected')
    
        connection.query("SELECT * FROM user WHERE cat = ?;",[req.params.cat], (err, rows)=> {
            connection.release();
            if(!err){
                res.render('pictures', {rows});
            }err
        });
    });
});


//port
app.listen(port, () => console.log(`listening on port ${port}`));