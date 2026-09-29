import mongoose from "mongoose"


interface EmailInfo {
    email: string;
}


const emailSchema = new mongoose.Schema<EmailInfo>({
    email: {
        type: String,
    }
})

const email = mongoose.model<EmailInfo>("email", emailSchema)
export { email }