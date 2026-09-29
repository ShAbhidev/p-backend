import { Request, Response } from 'express'

export const GetSendGridStats = async (
    req: Request,
    res: Response
) => {
    try {
        const { start_date: startDate, end_date: endDate } = req.query;
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        const start = typeof startDate === 'string' ? startDate : '';
        const end = typeof endDate === 'string' ? endDate : '';

        if (!datePattern.test(start) || !datePattern.test(end) || start > end) {
            return res.status(400).json({ message: 'Provide a valid start_date and end_date.' });
        }

        const apiKey = process.env.SEND_API_SECRET ?? process.env.SENDGRID_API_KEY;
        if (!apiKey) {
            return res.status(503).json({ message: 'SendGrid API key is not configured.' });
        }

        const params = new URLSearchParams({
            start_date: start,
            end_date: end,
            aggregated_by: 'day'
        });
        const response = await fetch(`https://api.sendgrid.com/v3/stats?${params}`, {
            headers: { Authorization: `Bearer ${apiKey}` }
        });
        const body: unknown = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                message: 'SendGrid stats request failed.',
                details: body
            });
        }

        return res.status(200).json(body);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch SendGrid stats"
        });
    }
};



