var express = require('express');
var exphbs = require('express-handlebars');
require('dotenv').config()
var bodyParser = require('body-parser');
const mercadopago = require('mercadopago');
const { SITE_URL, PROD_ACCESS_TOKEN, PAYER_EMAIL, INTEGRATOR_ID, COLLECTOR_ID, PORT } = process.env
var port = PORT || 3000
var app = express();

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
    const { title, price, unit, img } = req.query
    let preference = {
        access_token: PROD_ACCESS_TOKEN,
        integrator_id: INTEGRATOR_ID,
        collector_id: parseInt(COLLECTOR_ID),
        auto_return: "approved",
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
        items: [
            {
                id: "1234",
                title,
                currency_id: "PEN",
                description: "“​Dispositivo móvil de Tienda e-commerce​”",
                picture_url: `${SITE_URL}${img.replace('.', '')}`,
                unit_price: parseInt(price),
                quantity: parseInt(unit),
            }
        ],
        back_urls: {
            success: `${SITE_URL}/success`,
            failure: `${SITE_URL}/failure`,
            pending: `${SITE_URL}/pending`,
        },
        payment_methods: {
            excluded_payment_types: [
                {
                    id: "atm"
                }
            ],
            excluded_payment_methods: [
                {
                    id: "diners"
                }
            ],
            installments: 6
        }
    };
    mercadopago.preferences.create(preference)
        .then(function (response) {
            console.info(response.body.id)
            let init_point = response.body.init_point;
            res.render('detail', { ...req.query, init_point });
        }).catch(function (error) {
            console.log(error);
            res.render('failure', req.query);
        });
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
app.use(bodyParser.json())
app.post('/webhook', function (req, res) {
    console.log(req.body)
    res.status(200).end()
});
app.listen(port);