# Contributing

1. Install node 14.3+
2. Install postgres 12.2, create a `druid` user, a `druidlocal` database, with `druid` user as the owner
3. Login to your heroku account with [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install) if not already downloaded and logged in
4. Run `PGUSER=postgres PGPASSWORD=postgres heroku pg:pull DATABASE_URL druidlocal --app druid-backend-prod`
  fill in your own postgres password from your install
5. Create a `.env` file, using `.env.sample` as a template
6. Grant all privaleges to all tables in `druidlocal` db to the `druid` user if needed/never done before
7. Run `npm run test` to make sure everything is working correctly
