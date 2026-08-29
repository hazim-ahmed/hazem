import 'package:intl/intl.dart';

class AppFormatters {
  static final NumberFormat currency = NumberFormat('#,##0.00', 'en_US');
  static final DateFormat date = DateFormat('yyyy-MM-dd');
  static final DateFormat dateTime = DateFormat('yyyy-MM-dd HH:mm');

  static String formatCurrency(dynamic amount) {
    final numValue = num.tryParse(amount?.toString() ?? '') ?? 0;
    return '${currency.format(numValue)} ر.س';
  }

  static String formatDate(DateTime dt) => date.format(dt);
}

class Formatters {
  static String currency(dynamic amount) => AppFormatters.formatCurrency(amount);
  static String date(DateTime dt) => AppFormatters.formatDate(dt);
}
