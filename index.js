import express from 'express';
import { body, validationResult } from 'express-validator';
import { guestbookentries } from './data.js';
import fs from 'fs';

const app = express();
const PORT = 9898;

app.set('view engine', 'ejs');

app.use(express.static('./public'));

app.use(express.urlencoded({ extension: true }));

app.get('/', (_, res) => {
    res.render('index', { guestbookentries, error: null })
})

app.post('/add',
    body('useremail').isEmail(),  // ist eine middleware
    body('username').isLength({ min: 5, max: 50 }), // ist eine middleware
    (req, res) => {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            console.log(errors);
            return res.render('index', { guestbookentries, error: errors })
        }

        guestbookentries.push({
            name: req.body.username,
            email: req.body.useremail,
            text: req.body.usertext
        })


        fs.readFile('./data.js', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            var result = data.replace(']', `,\n{name: "${req.body.username}",email: "${req.body.useremail}",text: "${req.body.usertext}"}\n]`);

            fs.writeFile('./data.js', result, 'utf8', function (err) {
                if (err) return console.log(err);
            });

            fs.writeFile('./data.json', result, 'utf8', function (err) {
                if (err) return console.log(err);
            });

        });

        fs.copyFile('./data.js', './data.json', (err) => {
            if (err) {
                console.log('Error Occurred:', err);
            } else {
                console.log('File Copied Successfully!')
            }
        });



        res.render('index', { guestbookentries, error: null })
    })

app.listen(PORT, () => {
    console.log('Server runs on PORT : ', PORT);
})