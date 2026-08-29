import 'package:flutter/material.dart';
import '../../../core/utils/formatters.dart';
import '../../../models/transaction_model.dart';

class TransactionCard extends StatelessWidget {
  final ExpenseTransactionModel tx;

  const TransactionCard({super.key, required this.tx});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  tx.description,
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                AppFormatters.formatCurrency(tx.amount),
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0F766E),
                  fontFamily: 'monospace',
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              _badge(
                icon: Icons.tag_rounded,
                text: tx.systemReference,
                color: const Color(0xFFF1F5F9),
                textColor: const Color(0xFF475569),
              ),
              if (tx.beneficiaryName != null)
                _badge(
                  icon: Icons.person_rounded,
                  text: tx.beneficiaryName!,
                  color: const Color(0xFFF0FDF4),
                  textColor: const Color(0xFF166534),
                ),
              if (tx.categoryName != null)
                _badge(
                  icon: Icons.category_rounded,
                  text: tx.categoryName!,
                  color: const Color(0xFFEFF6FF),
                  textColor: const Color(0xFF1E40AF),
                ),
              if (tx.projectName != null)
                _badge(
                  icon: Icons.business_rounded,
                  text: tx.unitNumber != null ? '${tx.projectName} (${tx.unitNumber})' : tx.projectName!,
                  color: const Color(0xFFFAF5FF),
                  textColor: const Color(0xFF6B21A8),
                ),
              if (tx.createdByName != null && tx.createdByName!.isNotEmpty)
                _badge(
                  icon: Icons.account_circle_outlined,
                  text: 'بواسطة: ${tx.createdByName}',
                  color: const Color(0xFFF8FAFC),
                  textColor: const Color(0xFF475569),
                ),
              _statusBadge(tx.status),
              if (tx.invoiceStatus == 'ATTACHED')
                _badge(
                  icon: Icons.receipt_rounded,
                  text: 'فاتورة مرفقة',
                  color: const Color(0xFFECFDF5),
                  textColor: const Color(0xFF065F46),
                ),
            ],
          ),

          if (tx.rejectionReason != null && tx.rejectionReason!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1F2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'سبب الرفض: ${tx.rejectionReason}',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFBE123C)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _badge({required IconData icon, required String text, required Color color, required Color textColor}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(8)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: textColor),
          const SizedBox(width: 4),
          Text(text, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: textColor)),
        ],
      ),
    );
  }

  Widget _statusBadge(String status) {
    Color bg;
    Color text;
    String label;

    switch (status) {
      case 'OFFLINE_PENDING':
        bg = const Color(0xFFFEF3C7);
        text = const Color(0xFFD97706);
        label = 'معلق محلياً 📡';
        break;
      case 'APPROVED':
        bg = const Color(0xFFDCFCE7);
        text = const Color(0xFF15803D);
        label = 'معتمد';
        break;
      case 'REJECTED':
        bg = const Color(0xFFFFE4E6);
        text = const Color(0xFFBE123C);
        label = 'مرفوض';
        break;
      default:
        bg = const Color(0xFFFEF3C7);
        text = const Color(0xFFB45309);
        label = 'قيد المراجعة';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)),
      child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: text)),
    );
  }
}
