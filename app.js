//invocamos a express
const express = require("express");
const app = express();

//seteamos urlencoded para capturar los datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//invocamos dontenv
const dotenv = require('dotenv');
dotenv.config({path: './env/.env'});

app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//Establecemos el motor de plantillas
app.set('view engine', 'ejs');

//invocamos a bcryptjs
const bcryptjs = require('bcryptjs');

//configuramos variables de sesion
const session = require('express-session');
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}));

//Invocamos al modulo de conexion de la base de datos
const connection = require('./database/db');

//Establecemos las rutas
app.get('/login', (req, res)=>{
    res.render('login');
})
app.get('/register', (req, res)=>{
    res.render('register');
})

//Registracion
app.post('/register', async (req, res)=>{
    const user = req.body.user;
    const rol = req.body.rol;
    const pass = req.body.pass;
    const name = req.body.name;
    const lastname = req.body.lastname;
    const cedula = req.body.cedula;
    const date = req.body.date;
    const email = req.body.email;
    const celular = req.body.celular;

    let passwordHaash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO users SET ?', {user:user, rol:rol, pass:passwordHaash, name:name, lastname:lastname, cedula:cedula, date:date, email:email, celular:celular}, async(error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('register',{
                alert: true,
                alertTitle: "Registration",
                alertMessage: "¡Sucessful Registration!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta:''
            })
        }
    })
})

//Autenticacion
app.post('/auth', async (req, res)=>{
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    if(user && pass){
        connection.query('SELECT * FROM users WHERE user = ?', [user], async(error, results) =>{
            if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                res.render('login',{
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "USUARIO y/o PASSWORD incorrectas",
                    alertIcon:'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            }else{
                req.session.loggedin = true;
                req.session.name = results[0].name
                res.render('login',{
                    alert: true,
                    alertTitle: "Conexión exitosa",
                    alertMessage: "!Login Correcto¡",
                    alertIcon:'success',
                    showConfirmButton: false,
                    timer: 1000,
                    ruta: ''
                });
            }
        })
    }else{
        res.render('login',{
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "Por favor ingrese un usuario y/o contraseña",
            alertIcon:'warning',
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
        });
    }
})

//Auth Pages
app.get('/', (req, res)=>{
    if(req.session.loggedin){
        res.render('index',{
            login: true,
            name: req.session.name
        });
    }else{
        res.render('login',{
            login: false,
        })
    }
})

//Logout
app.get('/logout', (req, res)=>{
    req.session.destroy(()=>{
        res.redirect('/login')
    })
})

app.listen(3000, (req, res)=>{
    console.log('SERVER RUNNING IN http://localhost:3000');
}) 