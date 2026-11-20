import { Request, Response } from "express";
import { DemoDataService } from "../services/demo-data.service";
import { handleError } from "../utils/handle-error";

export class DemoDataController {
    private demoDataService = new DemoDataService();

    status = async (request: Request, response: Response) => {
        try {
            const hasDemoData = await this.demoDataService.hasDemoData();
            return response.status(200).json({ success: true, data: { hasDemoData } });
        } catch (error) {
            return handleError(response, error);
        }
    };

    import = async (request: Request, response: Response) => {
        try {
            const result = await this.demoDataService.importData(request.user!.id);
            return response.status(200).json({ success: true, data: result });
        } catch (error) {
            return handleError(response, error);
        }
    };

    delete = async (request: Request, response: Response) => {
        try {
            const result = await this.demoDataService.deleteData();
            return response.status(200).json({ success: true, data: result });
        } catch (error) {
            return handleError(response, error);
        }
    };
}
