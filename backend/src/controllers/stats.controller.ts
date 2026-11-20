import { Request, Response } from "express";
import { StatsService } from "../services/stats.service";
import { handleError } from "../utils/handle-error";

export class StatsController {
    private statsService = new StatsService();

    overview = async (request: Request, response: Response) => {
        try {
            const stats = await this.statsService.overview(request.user!);
            return response.status(200).json({ success: true, data: stats });
        } catch (error) {
            return handleError(response, error);
        }
    };
}
