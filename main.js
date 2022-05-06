// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Notification,
} = require("electron");
const path = require("path");
const fs = require("fs");

function isInDevMode() {
  return !app.isPackaged;
}

let mainWindow;
let openedFilePath;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  if (isInDevMode) mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("createDocumentTriggerd", () => {
  let dateNow = new Date(Date.now());
  let year = dateNow.getFullYear();
  let month = dateNow.getMonth() + 1;
  let day = dateNow.getDate();
  let hour = dateNow.getUTCHours() - dateNow.getTimezoneOffset()/60;
  let minute = dateNow.getMinutes();
  let date =
    year +
    padZeros(month, 2) +
    padZeros(day, 2) +
    `_` +
    padZeros(hour, 2) +
    padZeros(minute, 2);

  dialog
    .showSaveDialog(mainWindow, {
      title: "Choose file name",
      defaultPath: `MyFile_${date}`,
      filters: [
        { name: "csv file", extensions: ["csv"] },
        { name: "Text file", extensions: ["txt"] },
      ],
    })
    .then(({ filePath }) => {
      if (filePath != "") {
        console.log(filePath);
        fs.writeFile(filePath, "", (error) => {
          if (error) {
            handleError(
              "Error while try create file: " +
                path.basename(filePath) +
                "\n" +
                error
            );
            console.log("error", error);
          } else {
            openedFilePath = filePath;
            mainWindow.webContents.send("documentCreated", filePath);
          }
        });
      } else {
        mainWindow.webContents.send("documentCreated", "fail");
      }
    });
});

ipcMain.on("writeToDocument", (event, args) => {
  console.log(args);
  if (openedFilePath) {
    fs.appendFile(openedFilePath, args, (error) => {
      if (error) {
        handleError("Error while try to write to document:\n" + error);
        console.log("error", error);
      }
    });
  } else {
    handleError("file path is not set");
  }
});

const handleError = (message) => {
  new Notification({
    title: "Error",
    body: message,
  }).show();
};

function padZeros(nummer,digits){return ([1e12] + nummer).slice(-digits);}
