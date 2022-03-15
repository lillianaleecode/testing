const puppeteer = require('puppeteer')

var url = 'https://www.bild.de';



describe('Puppeteer for AdTech', () => {
    it('should lauch the browser', async function() {
        const browser = await puppeteer.launch({
            headless: false, 
            //slowMo: 50, 
            devtools: true
        })
        const page = await browser.newPage() 
       // await page.goto('https://code.berlin/en/')//go to the URL page
       // await page.waitForSelector('p') //find a p tag or throw an error

        await page.goto(url)
        const title = await page.title()
        const urlLink = await page.url()

        console.log('Title: ' + title)
        console.log('URL: ' + urlLink)

        const ads = await page.evaluate("adSSetup"); //retrieves the adSetup
        console.log(ads);

        console.log("code for retrieving web console messages: ");

        

        page.on("console", consoleObj => console.log(consoleObj.text())); //this code doesnt work.

        const msgPromise = new Promise((resolve) => {
            page.on('console', resolve);
          });
        await page.evaluate('console.log("message")');
        const msg = await msgPromise;
        console.log({
        
        type: msg.type(),
        text: msg.text(),
        args: msg.args(),
        stacktrace: msg.stacktrace(),
        location: msg.location(),
        });

        page.on('response', response =>
        console.log(`${response.status()} ${response.url()}`)) //tells what the page has rendered

        

       // console.log(await page.evaluate(() => "bild.js"));

        
        
        //const adJsFile = await page.content('bild.js'); //retrieves the website but not the bild.js file..
       // console.log(adJsFile);


        //await page.goBack()
        //await page.waitFor(3000) //passing the amount of time i want to wait for
        //await page.reload() //reload browser
        await browser.close() //close browser after finishing the script
    })
})

//to run this, we add this in the package.json
//to run this terminal: npm run test
//to filter things

