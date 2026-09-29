import sgMail from '@sendgrid/mail'
import { Request, Response } from 'express'
import { email } from './../models/email.js'
import { list } from '../models/List.js'
import { stats } from "./../models/stats.js"


const sendMail = async (req: Request, res: Response) => {

    const em = req.body.data
    try {

        if (process.env.FROM_EMAIL) {
            console.log(process.env.FROM_EMAIL)
            let result = await sgMail.send({
                to: em,
                from: process.env.FROM_EMAIL,
                subject: 'Test Email',
                text: 'Hello from SendGrid!',
            })
            if (result) {
                
                res.send(result)
            }
        }
    } catch (error) {
        console.log(error)
    }

}


const addMail = async (req: Request, res: Response) => {
    try {
        // console.log("req:",req.body)
        const em = req.body.email
        const listname = req.body.currList
        console.log(em, listname)
        if (!(listname === "")) {

            let data = await email.insertOne({ email: em })
            console.log(data._id)
            let listAdd = await list.updateOne({ listname: listname }, { $push: { email: data._id } })
            console.log(listAdd)
            res.status(200).json({ message: "Email Added" })
        } else {
            res.status(404).json({ message: "please select the list first" })
        }
    } catch (error) {
        console.log(error)
    }

}

const getData = async (req: Request, res: Response) => {
    // console.log(req)
    let listname = req.query.currList
    if (typeof listname !== "string") {
        return res.status(400).json({
            message: "Invalid listname"
        });
    }
    try {
        if (listname === "") {
            let mails = await email.find()
            let lists = await list.find()
            return res.status(200).json({ mails, lists, message: "not filtered" })

        }
        else {

            let mails = await list.findOne({ listname }).populate("email")
            let lists = await list.find()
            res.status(200).json({ mails, lists, message: "filtered" })
        }

    } catch (error) {
        console.log(error)

    }

}
const sendingMails = async (req: Request, res: Response) => {
    console.log("sendingEmails")
    interface EmailsInfo {
        email: string;
    }
    try {
        const { data } = req.body
        console.log(data)

        const personalizations = data.map((item: EmailsInfo) => ({
            to: [{ email: item.email }]
        }));
        if (personalizations) {
            if (process.env.FROM_EMAIL) {
                console.log(process.env.FROM_EMAIL)
                let result = await sgMail.send({
                    from: process.env.FROM_EMAIL,
                    subject: 'Test Email',
                    text: 'Hello from SendGrid!',
                    personalizations
                })
                if (result) {
                
                    // data.map(async (i: number) => {

                    //     let count = await stats.findById("6abb5c78b9136789abcc7342")
                    //     console.log(count)
                    //     let requestCount = count?.requests
                    //     console.log(requestCount)
                    //     if (requestCount) {
                    //         console.log("checkit")
                    //         let updatecount = await stats.findByIdAndUpdate("6abb5c78b9136789abcc7342", { $inc: { requests: 1 } }, { new: true })
                    //         console.log(updatecount)
                    //     }
                    // })
                    res.status(200).json(result)
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
}



export { sendMail, addMail, getData, sendingMails }