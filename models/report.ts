import mongoose from "mongoose"


interface reportInfo {
    email: string,
    event: string,
    reason: string,
    response: string,
    sg_event_id: string,
    sg_message_id: string,
    timestamp: number
    tls: number
}


const reportSchema = new mongoose.Schema<reportInfo>({
    email: {
        type: String
    },
    event: {
        type: String
    },
    reason: {
        type: String
    },
    response: {
        type: String
    },
    sg_event_id: {
        type: String
    },
    sg_message_id: {
        type: String
    },
    timestamp: {
        type: Number
    },
    tls: {
        type: Number
    }
})

const report = mongoose.model<reportInfo>("report",reportSchema)
export {report}