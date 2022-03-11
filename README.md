# postgres-dev
A local postgres development database running with docker, managed directly from within the codebase.

(Check it out on npm: https://www.npmjs.com/package/postgres-dev)

# Requirements

You should have installed docker (https://www.docker.com/) on your machine and it should be available in your PATH variable.
(Make sure that the docker daemon is running when using this package).

# How to use
First, import the PostgresDev class from the package.
```import { PostgresDev } from "postgres-dev";```
Then just start a local pg instance via the ```PostgresDev.startPostgresDev(...)``` method.

Example:
```
PostgresDev.startPostgresDev(
  "root_user",
  "root_pw",
  "db_name",
  "container_name",
  5432
).then((success) => {
  // do smth.
});
```

And that's it!

# Custom initialization
To load initial data into the db or do some other custom initial setup, you can pass the **absolute** path to an *.sql, *.sql.gz, or *.sh file that gets executed before startup.
