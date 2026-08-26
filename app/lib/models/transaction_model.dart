import '../core/utils/response_helpers.dart';

class ExpenseTransactionModel {
  final int id;
  final String systemReference;
  final double amount;
  final String description;
  final String? notes;
  final String? manualVoucherNumber;
  final String? paymentReference;
  final String status;
  final String invoiceStatus;
  final String? rejectionReason;
  final String? beneficiaryName;
  final String? categoryName;
  final String? projectName;
  final String? unitNumber;
  final String? createdByName;

  ExpenseTransactionModel({
    required this.id,
    required this.systemReference,
    required this.amount,
    required this.description,
    this.notes,
    this.manualVoucherNumber,
    this.paymentReference,
    required this.status,
    required this.invoiceStatus,
    this.rejectionReason,
    this.beneficiaryName,
    this.categoryName,
    this.projectName,
    this.unitNumber,
    this.createdByName,
  });

  factory ExpenseTransactionModel.fromJson(Map<String, dynamic> json) {
    final ben = asMap(json['beneficiary']);
    final cat = asMap(json['category']);
    final prj = asMap(json['project']);
    final unt = asMap(json['projectUnit']);
    final creator = asMap(json['creator']);

    return ExpenseTransactionModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '') ?? 0,
      systemReference: json['systemReference']?.toString() ?? '-',
      amount: num.tryParse(json['amount']?.toString() ?? '')?.toDouble() ?? 0.0,
      description: json['description']?.toString() ?? '',
      notes: json['notes']?.toString(),
      manualVoucherNumber: json['manualVoucherNumber']?.toString(),
      paymentReference: json['paymentReference']?.toString(),
      status: json['status']?.toString() ?? 'PENDING_REVIEW',
      invoiceStatus: json['invoiceStatus']?.toString() ?? 'NOT_REQUIRED',
      rejectionReason: json['rejectionReason']?.toString(),
      beneficiaryName: ben['name']?.toString() ?? ben['commercialName']?.toString(),
      categoryName: cat['name']?.toString(),
      projectName: prj['projectName']?.toString() ?? prj['name']?.toString(),
      unitNumber: unt['unitNumber']?.toString(),
      createdByName: creator['fullName']?.toString() ?? creator['username']?.toString(),
    );
  }
}
