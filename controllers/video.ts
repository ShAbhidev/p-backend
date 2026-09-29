import { Request, Response } from 'express'
import { generateZoomSignature } from './../zoom.js'


const generate = (request: Request, response: Response) => {
    const { meeting, role } = request.body as { meeting?: string; role?: string }

    if (!meeting || !role) {
        response.status(400).json({ error: 'meeting and role are required' })
        return
    }

    response.json({ signature: generateZoomSignature(meeting, role) })
}
export { generate }