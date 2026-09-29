import mongoose, { Schema } from "mongoose"


interface ListInfo {
    listname: String;
    email: email
}

interface email {
    subject: string;
}

const listSchema = new mongoose.Schema<ListInfo>({
    listname: { type: String },
    email: [{
        type: Schema.Types.ObjectId,
        ref: "email"
    }]
})

const list = mongoose.model<ListInfo>("list", listSchema)
export { list }