var express = require('express');
var exphbs = require('express-handlebars');
require('dotenv').config()
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000
const { SITE_URL, PROD_ACCESS_TOKEN, PAYER_EMAIL, INTEGRATOR_ID, COLLECTOR_ID, PUBLIC_KEY } = process.env
var app = express();
// SDK de Mercado Pago
const mercadopago = require('mercadopago');
// Agrega credenciales
mercadopago.configure({
    access_token: PROD_ACCESS_TOKEN,
    integrator_id: INTEGRATOR_ID,
});
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));
app.get('/', function (req, res) {
    res.render('home');
});
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/detail', function (req, res) {
    res.render('detail', req.query);
});
app.get('/success', function (req, res) {
    res.render('success', req.query);
});
app.get('/pending', function (req, res) {
    res.render('pending', req.query);
});
app.get('/failure', function (req, res) {
    res.render('failure', req.query);
});
app.get('/redirectcho', function (req, res) {
    res.render('redirectcho', req.query);
});

app.post('/submit', function (req, res) {
    const { title, unit_price, quantity, picture_url } = req.body;
    let preference = {
        payer: {
            name: "Lalo",
            surname: "Landa",
            email: PAYER_EMAIL,
            phone: {
                area_code: "52",
                number: 5549737300
            },
            identification: {
                type: "DNI",
                number: "22334445"
            },
            address: {
                street_name: "Insurgentes Sur",
                street_number: 1602,
                zip_code: "03940"
            },
        },
        notification_url: `${SITE_URL}/webhook`,
        external_reference: "javier@jetdigital.cl",
        collector_id: parseInt(COLLECTOR_ID),
        items: [
            {
                id: 1234,
                title,
                currency_id: "PEN",
                picture_url: `${SITE_URL}${picture_url.replace('.', '')}`,
                unit_price: parseInt(unit_price),
                quantity: parseInt(quantity),
            }
        ],
        back_urls: {
            success: `${SITE_URL}/success`,
            failure: `${SITE_URL}/failure`,
            pending: `${SITE_URL}/pending`,
        },
        auto_return: "approved",
        payment_methods: {
            excluded_payment_methods: [
                {
                    id: "pagoefectivo_atm"
                }
            ],
            excluded_payment_methods: [
                {
                    id: "dinners"
                }
            ],
            installments: 6
        }
    };
    mercadopago.preferences.create(preference)
        .then(function (response) {
            console.info(response.body.id)
            let init_point = response.body.init_point;
            res.redirect(`/redirectcho?init_point=${init_point}`)
        }).catch(function (error) {
            console.log(error);
            res.render('failure', req.query);
        });
})
app.use(bodyParser.json())
app.post('/webhook', function (req, res) {
    console.log(req.body)
    res.status(200).end()
});
app.listen(port);