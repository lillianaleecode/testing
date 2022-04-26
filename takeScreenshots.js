// Taking Screenshots
const fs = require('fs');
const puppeteer = require('puppeteer')

//var url = 'https://www.bild.de';
var url = 'https://www.bild.de/news/ausland/news-ausland/schweiz-iphone-rettet-abgestuerztem-snowboarder-das-leben-79683022.bild.html'



describe('Taking Screenshots<3', () => {
    it('screenshot<3', async function() {
        const browser = await puppeteer.launch({
            headless: false,
            devtools: false,
            //slowMo: 50,
        })
        const page = await browser.newPage() 

        // Configure the navigation timeout
        //await page.setDefaultNavigationTimeout(0);
        this.timeout(0);

        await page.goto(url, {
            //waitUntil: 'networkidle2', //Wait for all non-lazy loaded images to load. networkidle2 works better than load, domcontentloaded or networkidle0
            // Remove the timeout
             timeout: 0
          });

        // force lazy loading
        // await page.evaluate(() => window.scrollTo(0, Number.MAX_SAFE_INTEGER));

        // await page.waitFor(3000);
        
        //
        // await page
        // .waitForSelector('#red-teaser-image')
        // .then(() => console.log('got it'));

        await page.setDefaultTimeout(0);
        
        await page.setViewport({ 
            width: 1600, 
            height: 2000, 
            //deviceScaleFactor: 1 
        });


//remove the cmp layer

        try {
            var frames = await page.frames();
            var cmpFrame = frames.find(
                f => f.url().indexOf("https://cmp2.bild.de/index.html") > -1); // return frame only if source matches
                if (cmpFrame == undefined) {
                    console.log("can't find cmp frame");
                } else {
                    const cmpButton = await cmpFrame.waitForSelector('button.message-component.message-button.no-children.focusable.sp_choice_type_11');
                    await cmpButton.click();
                }
            // proof that we really clicked the right button
            //await page.screenshot({ path: 'cmpClicked.png' });
        } catch (err) {
            console.log("error getting the cmp button")
            console.log(err);
            process.exit();
        }
       
     
        

//get the current timestamp, stringify it and use it as file name for the screenshot

        const currentDate = new Date();

        const currentDayOfMonth = currentDate.getDate();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const dateString = " " + currentDayOfMonth + "-" + (currentMonth + 1) + "-" + currentYear + " " + Date.now();
        // "day-month-2022"

//creating a folder
//there is no puppeteer function to create automatically a folder. it is necessary to use node Fs method.
        const path = `tests/screenshots/${dateString}`;

        fs.mkdirSync(path);

    

        const height = await page.evaluate(() => document.documentElement.offsetHeight);

        console.log(height)

        const viewportHeight = 2000

        const numberTimes = Math.floor(height/viewportHeight);
        console.log(numberTimes);

        //this code will scroll until the end of the page (full page)
        async function autoScroll(page){
            await page.evaluate(async () => {
                await new Promise((resolve, reject) => {
                    var totalHeight = 0;
                    var distance = 500;
                    var timer = setInterval(() => {
                        var scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
        
                        if(totalHeight >= scrollHeight - window.innerHeight){
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            });
        }

// scroll to end of page to load all sightloader slots
        await autoScroll(page);
        adSSetup = await page.evaluate("adSSetup");
        adSlots = adSSetup["adPlacements"];

        console.log("adSlots = ", adSlots)

        for (var i = 0; i < adSlots.length; i++) {
            console.log("current slot ", adSlots[i])
            // check if slot exists
            var selector = adSlots[i];
            var slotFound = await page.evaluate( async (selector) => {
                var slot = document.getElementById(selector);
                return slot ? true : false
            }, selector);

            console.log("selector found ", slotFound)
            // if slot exists - scroll into view & take screenshot
            if (slotFound) {
                await ScrollAdslotIntoView(page, adSlots[i]);
                await page.waitForTimeout(1500);
                console.log("a")
                await page.screenshot({ path: "tests/screenshots/" + adSlots[i] + ".png" });
                console.log("b")
                await page.waitForTimeout(250);
            } else {
                console.log("no slot for " + adSlots[i] + " found");
            }
        }

/* 
//scrolling function (for by distance partial)
        async function autoScroll2(page, distance){
            await page.evaluate(async (distance) => {
                await new Promise((resolve, reject) => {
                    window.scrollBy(0, distance);
                    resolve()
                });
            },distance);
        }
//screenshot by distance (partial)
        async function screenshot2(page){
            for (let i = 0; i < numberTimes; i++){
                await autoScroll2(page, 2000);
                await page.screenshot({ 
                    //path: `screenshot${Date.now()}.png`,
                    path: `${path}/Screenshot from desktop ${" " + dateString + " " + Date.now()} .png`,
                    type: "png",
                    timeout: 30000,
                })

            }
        } */

        async function ScrollAdslotIntoView(page, _adSlot) {
            console.log("ScrollAdslotIntoView(" + _adSlot + ") was called");
            await page.evaluate(async (_adSlot) => {
                return await new Promise(resolve => {
                    setTimeout(() => {
                        console.log("looking for adslot " + _adSlot);
                        var slot = document.getElementById(_adSlot);
                        if (slot != null) {
                            slot.scrollIntoView();
                            return resolve({"found": true});
                        } else {
                            console.log(_adSlot + " not found");
                            return resolve({"found": false});
                        }
                    }, 1000)
                })
            }, _adSlot);
        }


        console.log("hello 3");
        await screenshot2(page);

    
        const title = await page.title()
        const urlLink = await page.url()

        console.log('Title: ' + title)
        console.log('URL: ' + urlLink)

        await browser.close()



  
        
    })
})

//to run this terminal: npm run test takeScreenshots.js


