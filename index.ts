import { spawn } from "child_process";
import process from "process";

export class PostgresDev {
  private static containerName: string;

  /**
   * Starts a local postgres instance in a docker container that is removed
   * after the service stops running (e.g. by calling "stopPostgresDev").
   * @param {string} user The username that will be used to connect to the db.
   * @param {string} password The password that will be used to connect to the db.
   * @param {string} db The default database that is used by pg.
   * @param {string} containerName The name of the container that will
   * contain the pg instance.
   * @param {number} port The port on localhost that the db will listen on.
   * @param {string} initFile A possible **absolute** path to an
   * *.sql, *.sql.gz, or *.sh file for custom db initialization
   * that is run before startup.
   * @returns {Promise<boolean>} true on success; false when something went wrong.
   */
  public static async startPostgresDev(
    user: string,
    password: string,
    db: string,
    containerName: string,
    port: number,
    initFile?: string
  ): Promise<boolean> {
    if (await this.checkIfContainerExists(containerName)) {
      return false;
    }

    this.containerName = containerName;

    try {
      await this.createDB(user, password, db, containerName, port);
      console.log(containerName + ": Successfully created container!");

      if (initFile != undefined) {
        await this.copyDBInitFile(containerName, initFile);
        console.log(
          containerName + ": Successfully copied initialization files"
        );
      }

      await this.startDB(containerName);

      process.on("beforeExit", async (_) => {
        console.log(containerName + ": cleaning up");
        await PostgresDev.stopPostgresDev(containerName);
        process.exit();
      });

      process.on("SIGINT", async (_) => {
        console.log(containerName + ": cleaning up");
        await PostgresDev.stopPostgresDev(containerName);
        process.exit();
      });

      // waiting for db service to be available in container:
      await new Promise((resolve) => {
        setTimeout(() => {
          console.log(
            containerName + ": Database is available on port " + port + "..."
          );
          resolve(true);
        }, 5000);
      });
    } catch (err) {
      await this.stopPostgresDev(containerName);
      this.clear(containerName);
      throw err;
    }

    return true;
  }

  /**
   * Stops the last (if not specified otherwise) started container (and removes it).
   * @param {string} containerName optionally pass a containerName to stop.
   * @returns {Promise<boolean>} true on success; false when something went wrong.
   */
  public static async stopPostgresDev(
    containerName?: string
  ): Promise<boolean> {
    if (
      !(await this.checkIfContainerExists(containerName ?? this.containerName))
    ) {
      return false;
    }

    return new Promise<boolean>((resolve, reject) => {
      const childProcess = spawn("docker", [
        "stop",
        containerName ?? this.containerName,
      ]);

      childProcess.on("close", (code) => {
        if (code == 0) {
          resolve(true);
        } else {
          reject(
            new Error(
              containerName ??
                this.containerName +
                  ": Error while trying to stop container (maybe it doesn't exist?)"
            )
          );
        }
      });

      childProcess.on("error", (err) => reject(err));
    });
  }

  private static async clear(containerName?: string): Promise<void> {
    if (this.containerName == undefined && containerName == undefined) return;

    return new Promise<void>((resolve, reject) => {
      const childProcess = spawn("docker", [
        "rm",
        containerName ?? this.containerName,
      ]);

      childProcess.on("close", (code) => {
        if (code == 0) {
          resolve();
        } else {
          reject(
            new Error(
              containerName ??
                this.containerName + ": Error while trying to clear container"
            )
          );
        }
      });

      childProcess.on("error", (err) => reject(err));
    });
  }

  private static checkIfContainerExists(
    containerName: string
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const childProcess = spawn("docker", ["ps", "-a"]);

      childProcess.stdout.setEncoding("utf-8");
      childProcess.stdout.on("data", (output) => {
        resolve(output.includes(containerName));
      });

      childProcess.on("close", (code) => {
        if (code == 0) {
          resolve(true);
        } else {
          reject(
            new Error(
              containerName +
                ": Error while checking for existing container. Is the docker daemon running?"
            )
          );
        }
      });

      childProcess.on("error", (err) => reject(err));
    });
  }

  private static createDB(
    user: string,
    password: string,
    db: string,
    containerName: string,
    port: number
  ): Promise<number | null> {
    return new Promise<number | null>((resolve, reject) => {
      const childProcess = spawn("docker", [
        "create",
        "--publish",
        `${port}:5432`,
        "--rm",
        "--name",
        containerName,
        "-e",
        `POSTGRES_PASSWORD=${password}`,
        "-e",
        `POSTGRES_USER=${user}`,
        "-e",
        `POSTGRES_DB=${db}`,
        "postgres",
      ]);

      childProcess.on("exit", (code) => {
        if (code == 0) {
          resolve(code);
        } else {
          reject("Exited db creation with code " + code);
        }
      });

      childProcess.on("error", (err) => reject(err));
    });
  }

  private static copyDBInitFile(
    containerName: string,
    initFile: string
  ): Promise<number | null> {
    return new Promise<number | null>((resolve, reject) => {
      const childProcess = spawn("docker", [
        "cp",
        initFile,
        `${containerName}:/docker-entrypoint-initdb.d`,
      ]);
      childProcess.on("exit", (code) => {
        if (code == 0) {
          resolve(code);
        } else {
          reject(new Error("Exited db initialization with code " + code));
        }
      });
      childProcess.on("error", (err) => reject(err));
    });
  }

  private static startDB(containerName: string): Promise<number | null> {
    return new Promise<number | null>((resolve, reject) => {
      const childProcess = spawn("docker", ["start", containerName]);
      childProcess.on("exit", (code) => {
        if (code == 0) {
          resolve(code);
        } else {
          reject(new Error("Exited db startup with code " + code));
        }
      });
      childProcess.on("error", (err) => reject(err));
    });
  }
}
