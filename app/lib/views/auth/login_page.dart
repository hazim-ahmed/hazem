import 'package:flutter/material.dart';
import '../../core/config/app_config.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/cache_service.dart';
import '../../services/auth_service.dart';
import '../dashboard/main_navigation_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _apiUrlController;
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  bool _showPassword = false;
  bool _showUrlSettings = false;

  @override
  void initState() {
    super.initState();
    _apiUrlController = TextEditingController(text: AppConfig.defaultApiUrl);
    _loadStoredUrl();
  }

  Future<void> _loadStoredUrl() async {
    final url = await CacheService.getBaseUrl();
    if (mounted) setState(() => _apiUrlController.text = url);
  }

  @override
  void dispose() {
    _apiUrlController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);

    final baseUrl = _apiUrlController.text.trim();
    final api = ApiClient(baseUrl: baseUrl);
    final authService = AuthService(api);

    try {
      final user = await authService.login(
        _usernameController.text.trim(),
        _passwordController.text,
      );

      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => MainNavigationPage(api: api, user: user),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
          backgroundColor: const Color(0xFFE11D48),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF0F766E), Color(0xFF0D9488)],
                          begin: Alignment.topRight,
                          end: Alignment.bottomLeft,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0F766E).withValues(alpha: 0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: const Icon(Icons.receipt_long_rounded, size: 48, color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'تسجيل الدخول',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'نظام إدارة المصروفات وسندات الصرف اليومية',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 32),

                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          TextFormField(
                            controller: _usernameController,
                            decoration: const InputDecoration(
                              labelText: 'اسم المستخدم',
                              prefixIcon: Icon(Icons.person_outline_rounded, color: Color(0xFF0F766E)),
                            ),
                            validator: (val) => val == null || val.trim().isEmpty ? 'أدخل اسم المستخدم' : null,
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _passwordController,
                            obscureText: !_showPassword,
                            decoration: InputDecoration(
                              labelText: 'كلمة المرور',
                              prefixIcon: const Icon(Icons.lock_outline_rounded, color: Color(0xFF0F766E)),
                              suffixIcon: IconButton(
                                onPressed: () => setState(() => _showPassword = !_showPassword),
                                icon: Icon(_showPassword ? Icons.visibility_off_rounded : Icons.visibility_rounded),
                              ),
                            ),
                            validator: (val) => val == null || val.isEmpty ? 'أدخل كلمة المرور' : null,
                          ),
                          const SizedBox(height: 20),

                          GestureDetector(
                            onTap: () => setState(() => _showUrlSettings = !_showUrlSettings),
                            child: Row(
                              children: [
                                Icon(
                                  _showUrlSettings ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                                  size: 18,
                                  color: const Color(0xFF64748B),
                                ),
                                const SizedBox(width: 4),
                                const Text(
                                  'إعدادات رابط السيرفر (API URL)',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                                ),
                              ],
                            ),
                          ),
                          if (_showUrlSettings) ...[
                            const SizedBox(height: 10),
                            TextFormField(
                              controller: _apiUrlController,
                              style: const TextStyle(fontSize: 12, fontFamily: 'monospace'),
                              decoration: const InputDecoration(
                                labelText: 'رابط الخادم',
                                prefixIcon: Icon(Icons.dns_rounded, size: 18),
                              ),
                            ),
                          ],

                          const SizedBox(height: 24),
                          FilledButton(
                            onPressed: _loading ? null : _login,
                            style: FilledButton.styleFrom(
                              backgroundColor: const Color(0xFF0F766E),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              elevation: 2,
                            ),
                            child: _loading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                                  )
                                : const Text(
                                    'دخول للنظام',
                                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                                  ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
