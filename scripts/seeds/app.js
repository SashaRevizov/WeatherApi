exports.seed = async function (knex) {
  try {
    await knex('city').del();
    await knex('daily_weather').del();
    await knex('hourly_weather').del();

    await knex('city').insert([
      {
        name: 'Kiev',
      },
      {
        name: 'Warsaw',
      },
    ]);

    await knex('daily_weather').insert([
      {
        date: '2021-02-10',
        city_id: 1,
        max_temperature: 12,
        min_temperature: 2,
        avg_temperature: 7,
        avg_humidity: 22,
        max_wind_kph: 10,
      },
      {
        date: '2021-02-11',
        city_id: 1,
        max_temperature: 13,
        min_temperature: 3,
        avg_temperature: 8,
        avg_humidity: 23,
        max_wind_kph: 11,
      },
      {
        date: '2021-02-10',
        city_id: 2,
        max_temperature: 12,
        min_temperature: 2,
        avg_temperature: 7,
        avg_humidity: 22,
        max_wind_kph: 10,
      },
      {
        date: '2021-02-11',
        city_id: 2,
        max_temperature: 11,
        min_temperature: 1,
        avg_temperature: 6,
        avg_humidity: 21,
        max_wind_kph: 9,
      },
    ]);

    await knex('hourly_weather').insert([
      {
        time: '2021-02-10 00:00',
        city_id: 1,
        daily_weather_id: 1,
        temperature: 12,
        wind_kph: 6,
        feels_like: 21,
        heat_index: 9,
        chance_of_rain: 9,
        chance_of_snow: 0,
      },
      {
        time: '2021-02-10 01:00',
        city_id: 1,
        daily_weather_id: 1,
        temperature: 12,
        wind_kph: 6,
        feels_like: 21,
        heat_index: 9,
        chance_of_rain: 9,
        chance_of_snow: 0,
      },
      {
        time: '2021-02-10 00:00',
        city_id: 2,
        daily_weather_id: 3,
        temperature: 12,
        wind_kph: 6,
        feels_like: 21,
        heat_index: 9,
        chance_of_rain: 9,
        chance_of_snow: 0,
      },
      {
        time: '2021-02-10 01:00',
        city_id: 2,
        daily_weather_id: 3,
        temperature: 12,
        wind_kph: 6,
        feels_like: 21,
        heat_index: 9,
        chance_of_rain: 9,
        chance_of_snow: 0,
      },
    ]);
  } catch (err) {
    console.error(err);
  }
};
