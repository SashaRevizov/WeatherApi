const sqlite = require('sqlite3');
const path = require('path');

const getDbFilePath = path.join(__dirname, '../', 'db', 'data.db');

const db = new sqlite.Database(getDbFilePath, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Connected to the database.');
  }
});

const incrementNumCalls = (capital) => {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE city SET num_calls = (num_calls + 1) WHERE name = '${capital}'`, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

const getCapitalsFromDb = (needCalls) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT name ${needCalls ? ', num_calls' : ''} FROM city`, (err, rows) => {
      if (err) reject(err);

      resolve(rows);
    });
  });
};

const getDayWeather = (capital, date) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT
          date,
          max_temperature,
          min_temperature,
          avg_temperature,
          avg_humidity,
          max_wind_kph
      FROM
          daily_weather
      WHERE
          daily_weather.city_id = (SELECT city_id FROM city WHERE name = '${capital}')
          ${date ? `AND date = '${date}'` : ''}
      `,
      (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      }
    );
  });
};

const getHourlyWeather = (capital, date) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT
          time,
          temperature,
          wind_kph,
          feels_like,
          heat_index,
          chance_of_rain,
          chance_of_snow
      FROM
          hourly_weather
      WHERE
          daily_weather_id = (
              SELECT
                  daily_weather_id
              FROM
                  daily_weather
              WHERE
                  daily_weather.city_id = (
                      SELECT
                          city_id
                      FROM
                          city
                      WHERE
                          name = '${capital}')
                  AND daily_weather.date = '${date}')
      `,
      (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      }
    );
  });
};

module.exports.getCapitals = async (req, res) => {
  try {
    const capitals = await getCapitalsFromDb();
    res.status(200).json(capitals);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports.getWeather = async (req, res) => {
  const { capital, date } = req.body;
  try {
    await incrementNumCalls(capital);
    const dayWeather = await getDayWeather(capital, date);
    const hourlyWeather = await getHourlyWeather(capital, date);

    res.status(200).json({ dayWeather, hourlyWeather });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports.getAvgTemperature = async (req, res) => {
  const { capital } = req.body;
  try {
    let avgTemperatureForWeek;
    await incrementNumCalls(capital);
    const dailyWeather = await getDayWeather(capital);

    for (const item of dailyWeather) {
      if (!avgTemperatureForWeek) avgTemperatureForWeek = item.avg_temperature;
      avgTemperatureForWeek += item.avg_temperature;
    }

    avgTemperatureForWeek = (avgTemperatureForWeek / dailyWeather.length).toFixed(2);

    res.status(200).json({ avgTemperatureForWeek });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports.maxNumOfCalls = async (req, res) => {
  try {
    const capitals = await getCapitalsFromDb(true);
    let maxCalls = 0, cityName;

    for (const item of capitals) {
      if (item.num_calls > maxCalls) {
        maxCalls = item.num_calls;
        cityName = item.name;
      }
    }

    res.status(200).json({ name: cityName, num_calls: maxCalls });
  } catch (error) {
    res.status(500).json(error);
  }
};
