const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // We will host a small local server or just load a data URI.
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    await page.goto('file:///Users/venkatragavn/june%20slot1/Tea%20Shop/admin-dashboard.html');
    
    // Wait for a bit
    await new Promise(r => setTimeout(r, 2000));
    
    // Check if the chart is empty by getting a few pixels
    const canvasData = await page.evaluate(() => {
        const c = document.getElementById('admin-members-chart');
        if(!c) return 'No canvas';
        const ctx = c.getContext('2d');
        const data = ctx.getImageData(0,0,c.width,c.height).data;
        let sum = 0;
        for(let i=0; i<data.length; i+=4) {
            sum += data[i+3]; // alpha channel sum
        }
        return sum;
    });
    
    console.log('Canvas alpha sum:', canvasData);
    
    await browser.close();
})();
