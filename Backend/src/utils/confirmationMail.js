const transporter= require("./transporter")

async function confimrationMail(to,username) {

    try{
    
    const confirm = await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject: "Welcome to AUthSys",
        html: ` <p>Hi ${username}, now you are a part of our site! Please take time to survey.</p> `
    })

    console.log(to)
    console.log("Email sent successfully!")
    console.log(confirm.response)
}
catch(e){
    console.log("email error.")
    console.log(e)
}

}

module.exports= confimrationMail



