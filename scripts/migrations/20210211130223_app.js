exports.up = function (knex) {
  return knex.schema
    .dropTableIfExists('city')
    .dropTableIfExists('daily_weather')
    .dropTableIfExists('hourly_weather')
    .createTable('city', function (table) {
      table.primary().increments('city_id');
      table.string('name').notNullable();
      table.integer('num_calls').defaultTo(0);
    })
    .createTable('daily_weather', function (table) {
      table.primary().increments('daily_weather_id');
      table.string('date').notNullable();
      table.integer('city_id').notNullable().references('city.city_id');
      table.integer('max_temperature').notNullable();
      table.integer('min_temperature').notNullable();
      table.integer('avg_temperature').notNullable();
      table.integer('avg_humidity').notNullable();
      table.integer('max_wind_kph').notNullable();
    })
    .createTable('hourly_weather', function (table) {
      table.primary().increments('hourly_weather_id');
      table.string('time').notNullable();
      table.integer('city_id').notNullable().references('city.city_id');
      table.integer('daily_weather_id').notNullable().references('daily_weather.daily_weather_id');
      table.integer('temperature').notNullable();
      table.integer('wind_kph').notNullable();
      table.integer('feels_like').notNullable();
      table.integer('heat_index').notNullable();
      table.integer('chance_of_rain').notNullable();
      table.integer('chance_of_snow').notNullable();
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('city').dropTable('daily_weather').dropTable('hourly_weather');
};
