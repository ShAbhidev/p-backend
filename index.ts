import dotenv from 'dotenv'
dotenv.config()
import express, { type Request, type Response } from 'express'
import cors from 'cors'
import routes from './routes/Routes.js'
import sgMail from '@sendgrid/mail'
import mongoose from 'mongoose'
import { stats } from './models/stats.js'
const app = express()
const allowedOrigins = [
  process.env.FrontendUrl,
  'https://unwed-predict-elaborate.ngrok-free.dev',
].filter((origin): origin is string => Boolean(origin))
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

console.log(process.env.FrontendUrl)
app.use("/", routes)

if (process.env.SEND_API_SECRET) {
  sgMail.setApiKey(process.env.SEND_API_SECRET)
}
console.log(process.env.MONGO_URL)

if (process.env.MONGO_URL) {

  async function main() {
    await mongoose.connect(process.env.MONGO_URL!)
  }
  main().then(async () => {
    console.log("connection done successfully")

  }).catch((err) => {
    console.log(err)
  })
}


app.post("/stats", async (req, res) => {
  console.log("check")
 let result = await stats.insertOne({
    requests: 0,
    delivered: 0,
    open: 0,
    clicked: 0,
    bounced: 0,
    spam: 0,
  })
  if(result){
    res.send("done")
  }

})


const port = Number(process.env.PORT) || 5000

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})