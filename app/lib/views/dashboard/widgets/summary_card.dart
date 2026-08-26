import 'package:flutter/material.dart';
import '../../../core/utils/formatters.dart';

class SummaryCard extends StatelessWidget {
  final Map<String, dynamic>? journal;
  final double totalSpent;
  final int transactionCount;

  const SummaryCard({
    super.key,
    required this.journal,
    required this.totalSpent,
    required this.transactionCount,
  });

  @override
  Widget build(BuildContext context) {
    final journalStatus = journal?['status']?.toString();
    final isApproved = journalStatus == 'APPROVED';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F766E), Color(0xFF0E7490)],
          begin: Alignment.topRight,
          end: Alignment.bottomLeft,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F766E).withValues(alpha: 0.25),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today_rounded, size: 13, color: Colors.white),
                        const SizedBox(width: 5),
                        Text(
                          journal?['systemDate']?.toString() ??
                              (journal?['journalDate'] != null ? journal!['journalDate'].toString().split('T').first : AppFormatters.formatDate(DateTime.now())),
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  if (journal != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isApproved ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        isApproved ? 'يومية معتمدة' : 'يومية مفتوحة',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                    ),
                ],
              ),
              Text(
                '$transactionCount عمليات',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Colors.white70),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text(
            'إجمالي منصرف اليوم',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white70),
          ),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                AppFormatters.currency.format(totalSpent),
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  fontFamily: 'monospace',
                ),
              ),
              const SizedBox(width: 6),
              const Text('ريال', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white70)),
            ],
          ),
        ],
      ),
    );
  }
}
