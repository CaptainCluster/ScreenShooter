/** 
@description The main purpose of this program is taking screenshots from the urls that 
are given to it by the user. It saves the screenshot in .jpg format.
@author CaptainCluster
@link https://github.com/CaptainCluster
*/
import puppeteer from "puppeteer"; //interactions with websites 
import readline from "readline"; //input from the user
import { URL } from "url"; //validating the url the user gives

mainFunction(); 

/**
 * @function mainFunction
 * @description - Forms the heart of the program and handles the main process
 */
async function mainFunction(){
  try{
    //We shall launch the browser here, making it re-usable.
    const browser = await puppeteer.launch();
    let userEndProgram = "";
    //The following while-loop will handle the entire process, from asking for core information
    //regarding the site to taking and saving the screenshot. Any exceptions will lead to the loop
    //starting all over, for example, an invalid url.
    while(userEndProgram != "n"){
      userEndProgram = ""
      const url = await askUserInput("Give the url: ");

      //Making sure the url given by the user is a valid one. If not, the loop is restarted.
      if(confirmUrl(url)){
        let fileName = "";

        while(fileName == ""){ //Making sure the user gives a file name (for saving the screenshot).
          fileName = await askUserInput("Give the file name (.jpg will be added automatically): ");
          fileName = fileName.replace(/[\\/*?:"<>|]/g, '_'); //Replacing the invalid characters with '_'
        }
        await takeScreenShot(url, fileName, browser);
        //Asking the user whether they want to capture more screenshots or not
        //y = yes, n = no
        while(userEndProgram != "y" && userEndProgram!= "n"){
          userEndProgram = await askUserInput("Do you want to continue? y/n: ");
          userEndProgram = userEndProgram.toLowerCase();

          if(userEndProgram == "y"){
            console.log("Continuing...\n");
          } else if(userEndProgram == "n"){
            console.log("Thank you for using the program!");
          } else{
            console.log("Please enter a valid letter.\n");
          }
        }
      } 
    }
    await browser.close();
    process.exit(0);
  } catch(error){
    console.log("Encountered the following error: " + error);
    if(browser != undefined){
      await browser.close();
    }
    process.exit(0);
  }
}

/**
 * @function askUserInput
 * @param {String} consoleText - The text that helps the user understand what information he has to give
 * @returns {String} - The function will return the input given by the user.
 */
async function askUserInput(consoleText){
  return new Promise((resolve) => {
    //We will use readline to create an interface that can read the user input
    const readlineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    //Next up, the program that asks for the input
    readlineInterface.question(consoleText, (userInput) => {
      readlineInterface.close();
      resolve(userInput); 
    });
  });
}

/**
 * @function takeScreenShot
 * @param {String} url - the url (validated at this point) the user has given
 * @param {String} fileName - the file name (validated at this point) the user has given
 * @param {puppeteerBrowser} browser - the browser that was launched at the start of the program
 */
async function takeScreenShot(url, fileName, browser){
  try{
    const webPage = await browser.newPage();
    await webPage.setViewport({width : 1920, height: 1080});
    await webPage.goto(url);
    //The program will save the screenshot to the savedimages folder.
    //The .jpg  format is automatically determined
    const path = "savedimages/" + fileName + ".jpg";
    await webPage.screenshot({path: path});

    await webPage.close();
    console.log("The screenshot has been successfully saved!\n")
  } catch(error){
    console.log("Encountered the following error: " + error);
  }
}

/**
 * @param {String} url - The url that the user has given. This is what will be checked.
 * @returns {Boolean} - Either true or false, depending on if the url is deemed valid.
 */
function confirmUrl(url){
  try{
    new URL(url);
    return true;
  } catch(error){
    console.log("The input you gave seems to be invalid. Try again.\n");
    return false;
  }
}