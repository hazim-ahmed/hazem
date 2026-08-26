import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/cache_service.dart';
import '../../models/auth_user.dart';
import '../auth/login_page.dart';
import '../expense/new_expense_view.dart';
import 'transactions_view.dart';

class MainNavigationPage extends StatefulWidget {
  final ApiClient api;
  final AuthUser user;

  const MainNavigationPage({super.key, required this.api, required this.user});

  @override
  State<MainNavigationPage> createState() => _MainNavigationPageState();
}

class _MainNavigationPageState extends State<MainNavigationPage> {
  int _currentIndex = 0;
  final GlobalKey<TransactionsViewState> _txViewKey = GlobalKey<TransactionsViewState>();
  final GlobalKey<NewExpenseViewState> _formViewKey = GlobalKey<NewExpenseViewState>();

  void _onExpenseSaved() {
    setState(() => _currentIndex = 0);
    _txViewKey.currentState?.reload();
  }

  void _logout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('تسجيل الخروج', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('هل أنت متأكد من رغبتك في تسجيل الخروج من التطبيق؟'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFFE11D48)),
            child: const Text('خروج'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await CacheService.clearAuthSession();
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => const LoginPage(),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF0F766E).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.account_balance_wallet_rounded, size: 20, color: Color(0xFF0F766E)),
            ),
            const SizedBox(width: 8),
            Text(_currentIndex == 0 ? 'سجل المصروفات' : 'تسجيل مصروف جديد'),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'تحديث البيانات',
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () {
              if (_currentIndex == 0) {
                _txViewKey.currentState?.reload();
              } else {
                _formViewKey.currentState?.reloadMasterData();
              }
            },
          ),
          IconButton(
            tooltip: 'تسجيل الخروج (${widget.user.fullName})',
            icon: const Icon(Icons.logout_rounded, color: Color(0xFFE11D48)),
            onPressed: _logout,
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: [
          TransactionsView(
            key: _txViewKey,
            api: widget.api,
            onNavigateToNew: () => setState(() => _currentIndex = 1),
          ),
          NewExpenseView(
            key: _formViewKey,
            api: widget.api,
            onSaved: _onExpenseSaved,
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: const Border(top: BorderSide(color: Color(0xFFE2E8F0))),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 10,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          elevation: 0,
          backgroundColor: Colors.transparent,
          selectedItemColor: const Color(0xFF0F766E),
          unselectedItemColor: const Color(0xFF94A3B8),
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.receipt_long_outlined),
              activeIcon: Icon(Icons.receipt_long_rounded),
              label: 'يومية المصروفات',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.add_circle_outline_rounded),
              activeIcon: Icon(Icons.add_circle_rounded),
              label: 'إدخال مصروف',
            ),
          ],
        ),
      ),
    );
  }
}
