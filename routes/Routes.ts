import { Router } from "express"
import { sendMail, addMail, getData, sendingMails } from '../controllers/emails.js'
import { generate } from '../controllers/video.js'
import { createList, SendGridWebhook, GetSendGridData } from '../controllers/list.js'
import { GetSendGridStats } from '../sendGrid.js'

const router = Router()


// router.route('/register').get(sendMail)
router.route('/add').post(addMail)
router.route('/getemails').get(getData)
router.route('/zoom/signature').post(generate)
router.route('/sending').post(sendingMails)
router.route('/sendingone').post(sendMail)
router.route('/addlist').post(createList)
router.route("/sendgrid/webhook").post(SendGridWebhook)
router.route("/sendgrid/data").get(GetSendGridData);
router.route("/sendgrid/stats").get(GetSendGridStats);
export default router