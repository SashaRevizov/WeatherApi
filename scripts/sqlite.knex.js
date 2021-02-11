const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: '../db/data.db',
  },
  useNullAsDefault: true,
});

module.exports = knex;
