import sgMail from '@sendgrid/mail'
import { Request, Response } from 'express'
import { email } from './../models/email.js'
import { list } from "./../models/List.js"
import { report } from "./../models/report.js"
import { stats } from "./../models/stats.js"



const createList = async (req: Request, res: Response) => {
    try {
        let { listname } = req.body
        console.log(listname)
        let result = await list.insertOne({ listname: listname })
        console.log(result)
        if (result) {
            res.status(200).json("New List Created")
        }
    } catch (error) {
        console.log(error)
    }

}
let sendGridData: any = null;

 const SendGridWebhook = async (req: Request, res: Response) => {
    console.log("🔥 WEBHOOK HIT");
    console.log("BODY:", req.body);

    sendGridData = req.body;

    return res.status(200).send("Webhook received");
};

 const GetSendGridData = async (req: Request, res: Response) => {
    console.log("🔥 GET DATA:", sendGridData);

    return res.status(200).json({
        data: sendGridData
    });
};


export { createList, SendGridWebhook,GetSendGridData }