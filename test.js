const fetch = require("node-fetch");
(
    async () => {
        try {
            const response = fetch('https://www.etax.nat.gov.tw/etwmain/front/ETW183W6?site=en')
                .then(res => res.text())
                .then(body => console.log(body));
        } catch (error) {
            console.log(error);
        }
    }
)();