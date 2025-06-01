const bcrypt = require('bcryptjs');
exports.hashPassword = password => bcrypt.hash(password, 10);
exports.comparePassword = (pw, hash) => bcrypt.compare(pw, hash);