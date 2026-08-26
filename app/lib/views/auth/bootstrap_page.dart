import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/cache_service.dart';
import '../../core/utils/response_helpers.dart';
import '../../models/auth_user.dart';
import '../dashboard/main_navigation_page.dart';
import 'login_page.dart';

class BootstrapPage extends StatefulWidget {
  const BootstrapPage({super.key});

  @override
  State<BootstrapPage> createState() => _BootstrapPageState();
}

class _BootstrapPageState extends State<BootstrapPage> {
  @override
  void initState() {
    super.initState();
    _checkSavedSession();
  }

  Future<void> _checkSavedSession() async {
    await Future.delayed(const Duration(milliseconds: 300));
    final session = await CacheService.getAuthSession();

    if (!mounted) return;
    if (session != null) {
      final api = ApiClient(
        baseUrl: session['baseUrl'],
        accessToken: session['accessToken'],
        refreshToken: session['refreshToken'],
      );
      final user = AuthUser.fromJson(asMap(session['user']));

      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => MainNavigationPage(api: api, user: user),
        ),
      );
    } else {
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
      backgroundColor: const Color(0xFF0F766E),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.account_balance_wallet_rounded, size: 56, color: Colors.white),
            ),
            const SizedBox(height: 20),
            const Text(
              'نظام إدارة المصروفات',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            const SizedBox(height: 8),
            const Text(
              'جاري التحقق من الجلسة المحفوظة...',
              style: TextStyle(fontSize: 13, color: Colors.white70),
            ),
            const SizedBox(height: 24),
            const CircularProgressIndicator(color: Colors.white),
          ],
        ),
      ),
    );
  }
}
