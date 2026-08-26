import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class CacheService {
  static const String _keyBaseUrl = 'app_base_url';
  static const String _keyAccessToken = 'app_access_token';
  static const String _keyRefreshToken = 'app_refresh_token';
  static const String _keyUserData = 'app_user_data';

  static Future<void> saveAuthSession({
    required String baseUrl,
    required String accessToken,
    required String refreshToken,
    required Map<String, dynamic> user,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyBaseUrl, baseUrl);
    await prefs.setString(_keyAccessToken, accessToken);
    await prefs.setString(_keyRefreshToken, refreshToken);
    await prefs.setString(_keyUserData, jsonEncode(user));
  }

  static Future<Map<String, dynamic>?> getAuthSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_keyAccessToken);
    if (token == null || token.isEmpty) return null;

    final baseUrl = prefs.getString(_keyBaseUrl) ?? AppConfig.defaultApiUrl;
    final refreshToken = prefs.getString(_keyRefreshToken) ?? '';
    final userStr = prefs.getString(_keyUserData);
    final user = userStr != null ? jsonDecode(userStr) : {};

    return {
      'baseUrl': baseUrl,
      'accessToken': token,
      'refreshToken': refreshToken,
      'user': user,
    };
  }

  static Future<String> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyBaseUrl) ?? AppConfig.defaultApiUrl;
  }

  static Future<void> clearAuthSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyAccessToken);
    await prefs.remove(_keyRefreshToken);
    await prefs.remove(_keyUserData);
  }

  static Future<void> saveCachedData(String key, dynamic data) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('cache_$key', jsonEncode(data));
  }

  static Future<dynamic> getCachedData(String key) async {
    final prefs = await SharedPreferences.getInstance();
    final str = prefs.getString('cache_$key');
    if (str != null && str.isNotEmpty) {
      try {
        return jsonDecode(str);
      } catch (_) {}
    }
    return null;
  }
}
