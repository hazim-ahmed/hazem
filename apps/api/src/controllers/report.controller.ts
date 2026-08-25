import { Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { ExportService } from '../services/export.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ReportController {
  static async getDailyExpenses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string;
      const data = await ReportService.getDailyExpensesReport(date);
      return sendSuccess(res, data, 'تم جلب تقرير المصروفات اليومية بنجاح');
    } catch (error) {
      next(error);
    }
  }

  static async exportDailyExpensesExcel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string;
      const data = await ReportService.getDailyExpensesReport(date);

      const rows = (data.transactions || []).map((tx: any, idx: number) => ({
        index: idx + 1,
        paymentMethod: tx.paymentMethod?.name || 'نقدي',
        voucherNo: tx.manualVoucherNumber || tx.systemReference || '-',
        date: tx.voucherDate ? new Date(tx.voucherDate).toISOString().slice(0, 10) : data.date,
        beneficiary: tx.beneficiary?.name || '-',
        details: tx.description || '-',
        amount: Number(tx.amount) || 0,
      }));

      await ExportService.generateExcel(
        {
          title: `تقرير المصروفات اليومية - ${data.date}`,
          reportDate: data.date,
          rows,
          totalAmount: data.totalAmount,
        },
        res,
        `Daily_Expenses_${data.date}`
      );
    } catch (error) {
      next(error);
    }
  }

  static async exportDailyExpensesPDF(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string;
      const data = await ReportService.getDailyExpensesReport(date);

      const rows = (data.transactions || []).map((tx: any, idx: number) => ({
        index: idx + 1,
        paymentMethod: tx.paymentMethod?.name || 'نقدي',
        voucherNo: tx.manualVoucherNumber || tx.systemReference || '-',
        date: tx.voucherDate ? new Date(tx.voucherDate).toISOString().slice(0, 10) : data.date,
        beneficiary: tx.beneficiary?.name || '-',
        details: tx.description || '-',
        amount: Number(tx.amount) || 0,
      }));

      await ExportService.generatePDF(
        {
          title: `جدول المصروفات اليومية`,
          reportDate: data.date,
          rows,
          totalAmount: data.totalAmount,
        },
        res,
        `Daily_Expenses_${data.date}`
      );
    } catch (error) {
      next(error);
    }
  }

  static async getExpensesByProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string, 10) : undefined;
      const data = await ReportService.getExpensesByProject(projectId);
      return sendSuccess(res, data, 'تم جلب تقرير المصروفات حسب المشروع بنجاح');
    } catch (error) {
      next(error);
    }
  }

  static async getExpensesByBeneficiary(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getExpensesByBeneficiary();
      return sendSuccess(res, data, 'تم جلب تقرير المصروفات حسب المستفيد بنجاح');
    } catch (error) {
      next(error);
    }
  }

  static async getExpensesByCategory(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getExpensesByCategory();
      return sendSuccess(res, data, 'تم جلب تقرير المصروفات حسب التصنيف بنجاح');
    } catch (error) {
      next(error);
    }
  }

  static async getUnassignedProjectTransactions(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getUnassignedProjectTransactions();
      return sendSuccess(res, data, 'تم جلب السندات غير المرتبطة بمشاريع بنجاح');
    } catch (error) {
      next(error);
    }
  }

  static async getPendingInvoices(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getPendingInvoicesReport();
      return sendSuccess(res, data, 'تم جلب تقرير الفواتير المعلقة بنجاح');
    } catch (error) {
      next(error);
    }
  }

  static async getManualVouchers(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getManualVouchersReport();
      return sendSuccess(res, data, 'تم جلب تقرير السندات اليدوية بنجاح');
    } catch (error) {
      next(error);
    }
  }
}
