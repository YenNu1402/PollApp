require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./src/database/mongodb');
const routes = require('./src/routes/index');
const pollRoutes = require('./src/routes/apis/poll.route');

app.use('/polls', pollRoutes);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public/images', express.static('src/public/images'));
app.set('view engine', 'ejs');
app.set('views', './src/views');

db.connect();
app.use('/api', routes);

app.get('/', (req, res) => res.render('home'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
