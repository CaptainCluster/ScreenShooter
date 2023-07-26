/** 
@author CaptainCluster
https://github.com/CaptainCluster
*/

/* 
We will use readline to get the url from the user 
Puppeteer will be used to enter the website and save the screenshot.
URL import will be used to help us validate the url the user gives
*/
import puppeteer from "puppeteer";
import readline from "readline";
import { URL } from "url";

mainFunction(); 

async function mainFunction(){
  try{
    //We will launch the browser using puppeteer here, making it reusable
    const browser = await puppeteer.launch();
    while(true){
      const url = await askUserInput("Give the url: ");
      //The process will be restarted if the url is invalid.
      if(confirmUrl(url)){
        let fileName = "";

        while(fileName == ""){
          fileName = await askUserInput("Give the file name (.jpg will be added automatically): ");
        }
        //The program attempts to remove discovered invalid characters from the given file name.
        fileName = fileName.replace(/[\\/*?:"<>|]/g, '');
        await takeScreenShot(url, fileName, browser);

        //We want to ask for a certain input to confirm the user is done. If the input is anything but the 
        //one we are looking for, the program will continue the while-loop.
        const confirmation = await askUserInput("If you want to stop searching for more screenshots, type 0: ");
        if(confirmation.toLowerCase() == "0"){
          break;
        } else{
          console.log("Continuing...");
        }
      }
    }
    console.log("Thank you for using the program!");
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

async function askUserInput(consoleText){
  //This function will be used to ask the user a certain input.
  //The consoleText parameter will contain the text that 
  //indicates what kind of information we want from the user.
  return new Promise((resolve) => {
    const readlineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    //Next up, the program asks for the input
    readlineInterface.question(consoleText, (input) => {
      readlineInterface.close();
      resolve(input); 
    });
  });
}

async function takeScreenShot(url, fileName, browser){
  //We will use puppeteer to enter the url and then it will
  //take a screenshot and save it in .jpg format.
  try{
    const webPage = await browser.newPage();

    await webPage.setViewport({width : 1920, height: 1080});
    await webPage.goto(url);

    //The program will save the screenshot to the savedimages folder.
    const path = "savedimages/" + fileName + ".jpg";
    await webPage.screenshot({path: path});

    await webPage.close();
    console.log("The screenshot has been successfully saved!\n")
  } catch(error){
    console.log("Encountered the following error: " + error);
  }
}

function confirmUrl(url){
  //This function makes sure the given url is valid and returns a boolean value.
  try{
    new URL(url);
    return true;
  } catch(error){
    console.log("The input you gave seems to be invalid. Try again.\n");
    return false;
  }
}
