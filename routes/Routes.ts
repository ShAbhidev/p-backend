import { Router } from "express"
import { sendMail, addMail, getData, sendingMails } from '../controllers/emails.js'
import { createList, SendGridWebhook, GetSendGridData } from '../controllers/list.js'
import { GetSendGridStats } from '../sendGrid.js'
import { createZoomMeeting, handleZoomCallback, startZoomAuthorization } from '../controllers/zoomOAuth.js'
import { exchangeCode, metacallback } from "../controllers/whatsapp.js"
const router = Router()


// router.route('/register').get(sendMail)
router.route('/add').post(addMail)
router.route('/getemails').get(getData)
router.route('/auth/zoom').get(startZoomAuthorization)
router.route('/callback').get(handleZoomCallback)
router.route('/sending').post(sendingMails)
router.route('/sendingone').post(sendMail)
router.route('/addlist').post(createList)
router.route("/sendgrid/webhook").post(SendGridWebhook)
router.route("/sendgrid/data").get(GetSendGridData);
router.route("/sendgrid/stats").get(GetSendGridStats);
router.route('/zoom/meetings').post(createZoomMeeting)
router.route("/meta/callback").get(metacallback)
router.route("/api/whatsapp/exchange-code").post(exchangeCode)
export default router