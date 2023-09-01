/** 
* This program takes a screenshot from the url the user has given. The user will
* specify both the url and the file name of the saved screenshot.
*
* @author CaptainCluster
* https://github.com/CaptainCluster
*/



import puppeteer from "puppeteer";    //interactions with websites 
import readline from "readline";      //input from the user
import { URL } from "url";            //validating the url the user gives
import { config } from "./config.js"  //A const object with a bunch of defined values
mainFunction(); 

async function mainFunction(){
  try{
    //We shall launch the browser here, making it re-usable.
    const puppeteerBrowser = await puppeteer.launch();

    let userEndProgram = ""; //y ==> continue, n ==> end program

    //The following while-loop will handle the entire process, from asking for core information
    //regarding the site to taking and saving the screenshot. Any exceptions will lead to the loop
    //starting all over, for example, an invalid url.
    while(userEndProgram != config.USER_INPUT_NO){
      userEndProgram = ""
      const url = await askUserInput(config.USERINPUT_REQUEST_URL);

      //Making sure the url is valid
      if(confirmUrl(url)){
        let screenshotFileName = "";

        while(screenshotFileName == ""){ 
          screenshotFileName = await askUserInput(config.USERINPUT_REQUEST_FILENAME);
          screenshotFileName = screenshotFileName.replace(/[\\/*?:"<>|]/g, '_'); //Replacing the invalid characters with '_'
        }
        await takeScreenShot(url, screenshotFileName, puppeteerBrowser);

        //Asking the user whether they want to capture more screenshots or not
        while(userEndProgram != config.USER_INPUT_YES && userEndProgram!= config.USER_INPUT_NO){
          userEndProgram = await askUserInput(config.USERINPUT_REQUEST_MESSAGE);
          userEndProgram = userEndProgram.toLowerCase();

          if(userEndProgram == config.USER_INPUT_YES){
            console.log(config.NOTIFICATION_CONTINUING);
          } else if(userEndProgram == config.USER_INPUT_NO){
            console.log(config.END_PROGRAM_THANKS);
          } else{
            console.log(config.ERROR_INVALID_INPUT_MESSAGE);
          }
        }
      } 
    }
    //Closing the browser and ending the program
    await puppeteerBrowser.close();
    process.exit(0);
  } catch(error){
    console.log(config.ERROR_DEFAULT_MESSAGE + error);
    if(puppeteerBrowser != undefined){
      await puppeteerBrowser.close();
    }
    process.exit(0);
  }
}

/**
 * @param {String} inputInstruction - Instructions to the user on what input should be given
 * @returns {String} - User input
 */
async function askUserInput(inputInstruction){
  return new Promise((resolve) => {
    //We will use readline to create an interface that can read the user input
    const readlineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    //Next up, the program that asks for the input
    readlineInterface.question(inputInstruction, (userInput) => {
      readlineInterface.close();
      resolve(userInput); 
    });
  });
}

/**
 * Taking the screenshot and saving it to a directory
 * 
 * @param {string} url - the url input provided by the user
 * @param {string} fileName - the file name provided by the user
 * @param {puppeteerBrowser} puppeteerBrowser - the browser that was launched at the start of the program
 */
async function takeScreenShot(url, fileName, puppeteerBrowser){
  try{
    //First we open webPage and go to the url
    const webPage = await puppeteerBrowser.newPage();
    await webPage.setViewport({width : config.SCREENSHOT_WIDTH, height: config.SCREENSHOT_HEIGHT});
    await webPage.goto(url);

    //Now that webPage is ready, we can take the screenshot.
    const path = config.FILE_DIRECTORY + fileName + config.FILE_FORMAT_JPG;
    await webPage.screenshot({path: path});
    await webPage.close();

    console.log(config.NOTIFICATION_SCREENSHOT_SAVED)
  } catch(error){
    console.log(config.ERROR_DEFAULT_MESSAGE + error);
  }
}

/**
 * Figuring out whether the url is valid or not
 * 
 * @param {string} url - the url input provided by the user
 * @returns {boolean}
 */
function confirmUrl(url){
  try{
    new URL(url);
    return true;
  } catch(error){
    console.log(config.ERROR_INVALID_INPUT_MESSAGE);
    return false;
  }
}