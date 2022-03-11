"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresDev = void 0;
var child_process_1 = require("child_process");
var process_1 = __importDefault(require("process"));
var PostgresDev = /** @class */ (function () {
    function PostgresDev() {
    }
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
    PostgresDev.startPostgresDev = function (user, password, db, containerName, port, initFile) {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkIfContainerExists(containerName)];
                    case 1:
                        if (_a.sent()) {
                            return [2 /*return*/, false];
                        }
                        this.containerName = containerName;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 10]);
                        return [4 /*yield*/, this.createDB(user, password, db, containerName, port)];
                    case 3:
                        _a.sent();
                        console.log(containerName + ": Successfully created container!");
                        if (!(initFile != undefined)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.copyDBInitFile(containerName, initFile)];
                    case 4:
                        _a.sent();
                        console.log(containerName + ": Successfully copied initialization files");
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.startDB(containerName)];
                    case 6:
                        _a.sent();
                        process_1.default.on("beforeExit", function (_) {
                            PostgresDev.stopPostgresDev(containerName);
                        });
                        // waiting for db service to be available in container:
                        return [4 /*yield*/, setTimeout(function () {
                                console.log(containerName + ": Database is available on port " + port + "...");
                            }, 5000)];
                    case 7:
                        // waiting for db service to be available in container:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 8:
                        err_1 = _a.sent();
                        return [4 /*yield*/, this.stopPostgresDev(containerName)];
                    case 9:
                        _a.sent();
                        this.clear(containerName);
                        throw err_1;
                    case 10: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Stops the last (if not specified otherwise) started container (and removes it).
     * @param {string} containerName optionally pass a containerName to stop.
     * @returns {Promise<boolean>} true on success; false when something went wrong.
     */
    PostgresDev.stopPostgresDev = function (containerName) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkIfContainerExists(containerName !== null && containerName !== void 0 ? containerName : this.containerName)];
                    case 1:
                        if (!(_a.sent())) {
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var childProcess = (0, child_process_1.spawn)("docker", [
                                    "stop",
                                    containerName !== null && containerName !== void 0 ? containerName : _this.containerName,
                                ]);
                                childProcess.on("close", function (code) {
                                    if (code == 0) {
                                        resolve(true);
                                    }
                                    else {
                                        reject(new Error(containerName !== null && containerName !== void 0 ? containerName : _this.containerName +
                                            ": Error while trying to stop container (maybe it doesn't exist?)"));
                                    }
                                });
                                childProcess.on("error", function (err) { return reject(err); });
                            })];
                }
            });
        });
    };
    PostgresDev.clear = function (containerName) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.containerName == undefined && containerName == undefined)
                    return [2 /*return*/];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var childProcess = (0, child_process_1.spawn)("docker", [
                            "rm",
                            containerName !== null && containerName !== void 0 ? containerName : _this.containerName,
                        ]);
                        childProcess.on("close", function (code) {
                            if (code == 0) {
                                resolve();
                            }
                            else {
                                reject(new Error(containerName !== null && containerName !== void 0 ? containerName : _this.containerName + ": Error while trying to clear container"));
                            }
                        });
                        childProcess.on("error", function (err) { return reject(err); });
                    })];
            });
        });
    };
    PostgresDev.checkIfContainerExists = function (containerName) {
        return new Promise(function (resolve, reject) {
            var childProcess = (0, child_process_1.spawn)("docker", ["ps", "-a"]);
            childProcess.stdout.setEncoding("utf-8");
            childProcess.stdout.on("data", function (output) {
                resolve(output.includes(containerName));
            });
            childProcess.on("close", function (code) {
                if (code == 0) {
                    resolve(true);
                }
                else {
                    reject(new Error(containerName +
                        ": Error while checking for existing container. Is the docker daemon running?"));
                }
            });
            childProcess.on("error", function (err) { return reject(err); });
        });
    };
    PostgresDev.createDB = function (user, password, db, containerName, port) {
        return new Promise(function (resolve, reject) {
            var childProcess = (0, child_process_1.spawn)("docker", [
                "create",
                "--publish",
                "".concat(port, ":5432"),
                "--rm",
                "--name",
                containerName,
                "-e",
                "POSTGRES_PASSWORD=".concat(password),
                "-e",
                "POSTGRES_USER=".concat(user),
                "-e",
                "POSTGRES_DB=".concat(db),
                "postgres",
            ]);
            childProcess.on("exit", function (code) {
                if (code == 0) {
                    resolve(code);
                }
                else {
                    reject("Exited db creation with code " + code);
                }
            });
            childProcess.on("error", function (err) { return reject(err); });
        });
    };
    PostgresDev.copyDBInitFile = function (containerName, initFile) {
        return new Promise(function (resolve, reject) {
            var childProcess = (0, child_process_1.spawn)("docker", [
                "cp",
                initFile,
                "".concat(containerName, ":/docker-entrypoint-initdb.d"),
            ]);
            childProcess.on("exit", function (code) {
                if (code == 0) {
                    resolve(code);
                }
                else {
                    reject(new Error("Exited db initialization with code " + code));
                }
            });
            childProcess.on("error", function (err) { return reject(err); });
        });
    };
    PostgresDev.startDB = function (containerName) {
        return new Promise(function (resolve, reject) {
            var childProcess = (0, child_process_1.spawn)("docker", ["start", containerName]);
            childProcess.on("exit", function (code) {
                if (code == 0) {
                    resolve(code);
                }
                else {
                    reject(new Error("Exited db startup with code " + code));
                }
            });
            childProcess.on("error", function (err) { return reject(err); });
        });
    };
    return PostgresDev;
}());
exports.PostgresDev = PostgresDev;
