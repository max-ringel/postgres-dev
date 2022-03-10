# postgres-dev
A local postgres development database running with docker, managed directly from within the codebase.

# Requirements

You should have installed docker (https://www.docker.com/) on your machine and it should be available in your PATH variable.

# How to use
First, import the PostgresDev class from the package.
```import { PostgresDev } from "postgres-dev";```
Then start a local pg instance via the ```PostgresDev.startPostgresDev(...)``` method.

Example:
```
PostgresDev.startPostgresDev(
  "root_user",
  "roow_pw",
  "db_name",
  "container_name",
  5432
).then((success) => {
  // do smth.
});
```

When exiting the project you should call ```PostgresDev.stopPostgresDev()``` to remove the running container.

When not called or when something got interrupted along the way and wasn't cleaned up, you might have to remove the container manually:

For example (careful):
```
> docker rm <container_name>
> docker volume prune
```

# Custom initialization
To load initial data into the db or do some other custom initial setup, you can pass the **absolute** path to an *.sql, *.sql.gz, or *.sh file that gets executed before startup.
