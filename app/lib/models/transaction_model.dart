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
  final int? beneficiaryId;
  final String? beneficiaryName;
  final int? categoryId;
  final String? categoryName;
  final int? projectId;
  final String? projectName;
  final int? projectUnitId;
  final String? unitNumber;
  final int? paymentMethodId;
  final String? paymentMethodName;
  final String? invoiceNumber;
  final String? invoiceDate;
  final double? invoiceAmount;
  final String? createdByName;
  final String? approvedByName;
  final String? createdAt;
  final List<dynamic> attachments;

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
    this.beneficiaryId,
    this.beneficiaryName,
    this.categoryId,
    this.categoryName,
    this.projectId,
    this.projectName,
    this.projectUnitId,
    this.unitNumber,
    this.paymentMethodId,
    this.paymentMethodName,
    this.invoiceNumber,
    this.invoiceDate,
    this.invoiceAmount,
    this.createdByName,
    this.approvedByName,
    this.createdAt,
    this.attachments = const [],
  });

  bool get isApproved => status.toUpperCase() == 'APPROVED' || status.toUpperCase() == 'POSTED';
  bool get isRejected => status.toUpperCase() == 'REJECTED';
  bool get isPending => !isApproved && !isRejected && status.toUpperCase() != 'CANCELLED';
  bool get isAssignedToProject => projectId != null && projectId! > 0;
  bool get hasInvoice => invoiceStatus == 'PROVIDED';
  bool get isInvoicePending => invoiceStatus == 'PENDING';

  factory ExpenseTransactionModel.fromJson(Map<String, dynamic> json) {
    final ben = asMap(json['beneficiary']);
    final cat = asMap(json['category']);
    final prj = asMap(json['project']);
    final unt = asMap(json['projectUnit']);
    final pm = asMap(json['paymentMethod']);
    final creator = asMap(json['creator']);
    final approver = asMap(json['approver']);

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
      beneficiaryId: json['beneficiaryId'] is int ? json['beneficiaryId'] : int.tryParse(json['beneficiaryId']?.toString() ?? ''),
      beneficiaryName: ben['name']?.toString() ?? ben['commercialName']?.toString(),
      categoryId: json['categoryId'] is int ? json['categoryId'] : int.tryParse(json['categoryId']?.toString() ?? ''),
      categoryName: cat['name']?.toString(),
      projectId: json['projectId'] is int ? json['projectId'] : int.tryParse(json['projectId']?.toString() ?? ''),
      projectName: prj['projectName']?.toString() ?? prj['name']?.toString(),
      projectUnitId: json['projectUnitId'] is int ? json['projectUnitId'] : int.tryParse(json['projectUnitId']?.toString() ?? ''),
      unitNumber: unt['unitNumber']?.toString(),
      paymentMethodId: json['paymentMethodId'] is int ? json['paymentMethodId'] : int.tryParse(json['paymentMethodId']?.toString() ?? ''),
      paymentMethodName: pm['name']?.toString(),
      invoiceNumber: json['invoiceNumber']?.toString(),
      invoiceDate: json['invoiceDate']?.toString(),
      invoiceAmount: num.tryParse(json['invoiceAmount']?.toString() ?? '')?.toDouble(),
      createdByName: creator['fullName']?.toString() ?? creator['username']?.toString(),
      approvedByName: approver['fullName']?.toString() ?? approver['username']?.toString(),
      createdAt: json['createdAt']?.toString(),
      attachments: asList(json['attachments']),
    );
  }

  factory ExpenseTransactionModel.fromOfflineJson(Map<String, dynamic> item) {
    return ExpenseTransactionModel(
      id: -1,
      systemReference: 'أوفلاين 📡',
      amount: num.tryParse(item['amount']?.toString() ?? '')?.toDouble() ?? 0.0,
      description: item['description']?.toString() ?? '',
      notes: item['notes']?.toString(),
      manualVoucherNumber: item['manualVoucherNumber']?.toString(),
      paymentReference: item['paymentReference']?.toString(),
      status: 'OFFLINE_PENDING',
      invoiceStatus: item['invoiceStatus']?.toString() ?? 'NOT_REQUIRED',
      beneficiaryName: 'في انتظار الشبكة',
      categoryName: 'مصروف محلي',
      createdByName: 'محلي (أوفلاين)',
    );
  }
}
