const sqlite = require('sqlite3');
const path = require('path');
const axios = require('axios');

//Должно быть в конфиге
const getDbFilePath = path.join(__dirname, '../', 'db', 'data.db');
const countryApi = 'https://restcountries.eu/rest/v2/region/europe?fields=capital';
const weatherApi = 'http://api.weatherapi.com/v1/history.json';
const weatherApiKey = 'f62b26967eb94a7fa9c182236211002';

const getCapitalsOfEurope = async () => {
  try {
    const resp = await axios.get(countryApi);
    return resp.data;
  } catch (err) {
    console.error(err);
  }
};

const getWeatherByCity = async (city, dateStart, dateEnd) => {
  try {
    const formatDateStart = dateStart.toISOString().substr(0, 10);
    const formatDateEnd = dateEnd.toISOString().substr(0, 10);
    const resp = await axios.get(weatherApi, {
      params: {
        key: weatherApiKey,
        q: city,
        dt: formatDateStart,
        end_dt: formatDateEnd,
      },
    });

    return resp.data;
  } catch (err) {
    console.error(err);
  }
};

const insertCapitalToDb = (db, capital) => {
  return new Promise((resolve, reject) => {
    db.all(`INSERT INTO city(name) VALUES (?)`, [capital], (err) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resolve();
    });
  });
};

const insertHourlyWeather = (db, capital, date, hourWeather) => {
  const { time, temp_c, wind_kph, feelslike_c, heatindex_c, chance_of_rain, chance_of_snow } = hourWeather;
  const getCityId = `
    SELECT city_id FROM city WHERE name = ?
  `;
  const getDayWeatherId = `
    SELECT daily_weather_id FROM daily_weather WHERE city_id = (${getCityId}) AND date = ?
  `;

  return new Promise((resolve, reject) => {
    db.all(
      `INSERT INTO hourly_weather (time, city_id, daily_weather_id, temperature, wind_kph, feels_like, heat_index, chance_of_rain, chance_of_snow)
    VALUES (?, (${getCityId}), (${getDayWeatherId}), ?, ?, ?, ?, ?, ?)`,
      [time, capital, capital, date, temp_c, wind_kph, feelslike_c, heatindex_c, chance_of_rain, chance_of_snow],
      (err) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        resolve();
      }
    );
  });
};

const insertDailyWeather = (db, capital, dayWeather) => {
  const { date } = dayWeather;
  const { maxtemp_c, mintemp_c, avgtemp_c, avghumidity, maxwind_kph } = dayWeather.day;
  const getCityId = `
    SELECT city_id FROM city WHERE name = ?
  `;

  return new Promise((resolve, reject) => {
    db.all(
      `INSERT INTO daily_weather (date, city_id, max_temperature, min_temperature, avg_temperature, avg_humidity, max_wind_kph)
    VALUES (?, (${getCityId}), ?, ?, ?, ?, ?)`,
      [date, capital, maxtemp_c, mintemp_c, avgtemp_c, avghumidity, maxwind_kph],
      (err) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        resolve();
      }
    );
  });
};

const insertInDb = async (db) => {
  try {
    const capitals = await getCapitalsOfEurope();
    const currentDate = new Date();
    const dateOffset = 24 * 60 * 60 * 1000 * 6; //6 days
    const weekAgo = new Date(currentDate.getTime() - dateOffset);

    for (const item of capitals) {
      const weather = await getWeatherByCity(item.capital, weekAgo, currentDate);
      const dailyWeather = weather.forecast.forecastday;

      console.log('Inserting into: ', item.capital);
      await insertCapitalToDb(db, item.capital);

      for (const day of dailyWeather) {
        await insertDailyWeather(db, item.capital, day);
        for (const hour of day.hour) {
          await insertHourlyWeather(db, item.capital, day.date, hour);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};

const initDb = (db) => {
  return new Promise((resolve, reject) => {
    db.exec(
      `BEGIN TRANSACTION;
        DROP TABLE IF EXISTS city;
        DROP TABLE IF EXISTS daily_weather; 
        DROP TABLE IF EXISTS hourly_weather; 
        CREATE TABLE city (
            city_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            num_calls INT DEFAULT 0
        );
        CREATE TABLE daily_weather (
            daily_weather_id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            city_id INTEGER NOT NULL,
            max_temperature INTEGER NOT NULL,
            min_temperature INTEGER NOT NULL,
            avg_temperature INTEGER NOT NULL,
            avg_humidity INTEGER NOT NULL,
            max_wind_kph INTEGER NOT NULL,
            FOREIGN KEY (city_id) REFERENCES city(city_id)
        );
        CREATE TABLE hourly_weather (
            hourly_weather_id INTEGER PRIMARY KEY AUTOINCREMENT,
            time TEXT NOT NULL,
            city_id INTEGER NOT NULL,
            daily_weather_id INTEGER NOT NULL,
            temperature INTEGER NOT NULL,
            wind_kph INTEGER NOT NULL,
            feels_like INTEGER NOT NULL,
            heat_index INTEGER NOT NULL,
            chance_of_rain INTEGER NOT NULL,
            chance_of_snow INTEGER NOT NULL,
            FOREIGN KEY (city_id) REFERENCES city(city_id) FOREIGN KEY (daily_weather_id) REFERENCES daily_weather(daily_weather_id)
        );
      END;`,
      (err) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        resolve();
      }
    );
  });
};

(async () => {
  const db = new sqlite.Database(getDbFilePath, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Connected to the database.');
    }
  });

  await initDb(db);
  await insertInDb(db);

  db.close();
})();
