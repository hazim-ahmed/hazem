import 'package:app/main.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('App bootstraps and launches properly', (tester) async {
    await tester.pumpWidget(const ExpenseMobileApp());
    await tester.pumpAndSettle(const Duration(seconds: 1));
    expect(find.byType(ExpenseMobileApp), findsOneWidget);
  });
}
