import mongoose from "mongoose"

interface statsInfo {
    requests:number
    delivered:number
    open:number
    clicked:number
    bounced:number
    spam:number
}

const statsSchema = new mongoose.Schema<statsInfo>({
    requests:{
        type:Number
    },
    delivered:{
        type:Number
    },
    open:{
        type:Number
    },
    clicked:{
        type:Number
    },
    bounced:{
        type:Number
    },
    spam:{
        type:Number
    }

})
const stats = mongoose.model<statsInfo>("stats",statsSchema)
export {stats}