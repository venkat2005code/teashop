const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

global.localStorage = { getItem: () => null, setItem: () => {} };
global.document = {
    addEventListener: () => {},
    documentElement: { getAttribute: () => 'light', setAttribute: () => {} },
    getElementById: (id) => ({
        getContext: () => ({
            clearRect: () => {},
            beginPath: () => {},
            roundRect: () => {},
            fill: () => {},
            stroke: () => {},
            moveTo: () => {},
            lineTo: () => {},
            arc: () => {},
            fillText: () => {},
            createLinearGradient: () => ({ addColorStop: () => {} })
        }),
        width: 350,
        height: 200
    })
};
global.window = { addEventListener: () => {} };
global.state = { currentDir: 'ltr' };
global.CanvasRenderingContext2D = function() {};
global.CanvasRenderingContext2D.prototype = { roundRect: function() {} };

try {
    eval(code);
    drawAdminMembersChart();
    console.log("Admin Members Chart OK");
    drawUserOrdersChart();
    console.log("User Orders Chart OK");
    drawAdminInventoryChart();
    console.log("Admin Inventory Chart OK");
    drawUserSettingsChart();
    console.log("User Settings Chart OK");
    drawAdminRevenueChart();
    console.log("Admin Revenue Chart OK");
} catch(e) {
    console.error(e);
}
