const smsSender = (otp,usernumber,res)=>{
    var request = require("request");
    var options = {
    method: "POST",
    url: "http://api.icombd.com/api/v3/sendsms/plain",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    form: {
        user: "himran",
        password: "hMD103245",
        sender: "8809617620815",
        text: `${otp}`,
        to: `${usernumber}`,
    },
    };
    request(options, function (error, response, body) {
        if (error) {
            return false
        };
        return true
        // return body;
    }
    );
}

module.exports = smsSender