# weatherApi
Для загрузки тестовых данных нужно перейти в папку scripts и выполнить команды: npx knex migrate:up -> npx knex seed:run
Для загрузки данных с открытого Api нужно перейти в папку scripts и выполнить файл init.js который создаст бд и заполнит ее погодными данными за неделю
Для старта сервера запустить файл index.js
Для тестирования API нужно импортировать коллекцию postman: https://www.getpostman.com/collections/9e279096e2ef840e1e91
