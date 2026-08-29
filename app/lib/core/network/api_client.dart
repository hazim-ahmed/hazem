import 'dart:convert';
import 'dart:io';

import '../config/app_config.dart';
import '../storage/cache_service.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient({required this.baseUrl, this.accessToken, this.refreshToken});

  String baseUrl;
  String? accessToken;
  String? refreshToken;
  bool _isRefreshing = false;

  Uri _uri(String path, [Map<String, String>? query]) {
    final cleanBase = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$cleanBase$cleanPath').replace(queryParameters: query);
  }

  Future<dynamic> get(String path, {Map<String, String>? query}) {
    return _requestWithRetry('GET', path, query: query);
  }

  Future<dynamic> post(String path, Map<String, dynamic> body) {
    return _requestWithRetry('POST', path, body: body);
  }

  Future<dynamic> patch(String path, Map<String, dynamic> body) {
    return _requestWithRetry('PATCH', path, body: body);
  }

  Future<dynamic> delete(String path) {
    return _requestWithRetry('DELETE', path);
  }

  Future<dynamic> _requestWithRetry(
    String method,
    String path, {
    Map<String, dynamic>? body,
    Map<String, String>? query,
    bool isRetry = false,
  }) async {
    try {
      return await _request(method, path, body: body, query: query);
    } on ApiException catch (e) {
      if (e.statusCode == 401 && !isRetry && refreshToken != null && refreshToken!.isNotEmpty && !_isRefreshing && !path.contains('/auth/')) {
        final refreshed = await _tryRefreshToken();
        if (refreshed) {
          return _request(method, path, body: body, query: query);
        }
      }
      rethrow;
    }
  }

  Future<bool> _tryRefreshToken() async {
    if (_isRefreshing || refreshToken == null || refreshToken!.isEmpty) return false;
    _isRefreshing = true;

    try {
      final res = await _request('POST', '/auth/refresh', body: {'refreshToken': refreshToken});
      if (res is Map && res['data'] != null) {
        final data = res['data'];
        final newAccess = data['accessToken']?.toString();
        final newRefresh = data['refreshToken']?.toString() ?? refreshToken;

        if (newAccess != null && newAccess.isNotEmpty) {
          accessToken = newAccess;
          refreshToken = newRefresh;

          final currentSession = await CacheService.getAuthSession();
          final user = currentSession?['user'] ?? {};
          await CacheService.saveAuthSession(
            baseUrl: baseUrl,
            accessToken: newAccess,
            refreshToken: newRefresh ?? '',
            user: user is Map<String, dynamic> ? user : {},
          );
          _isRefreshing = false;
          return true;
        }
      }
    } catch (_) {}

    _isRefreshing = false;
    return false;
  }

  Future<dynamic> _request(
    String method,
    String path, {
    Map<String, dynamic>? body,
    Map<String, String>? query,
  }) async {
    final client = HttpClient();
    client.connectionTimeout = AppConfig.requestTimeout;
    try {
      final request = await client.openUrl(method, _uri(path, query));
      request.headers.contentType = ContentType.json;
      request.headers.set(HttpHeaders.acceptHeader, 'application/json');
      if (accessToken != null && accessToken!.isNotEmpty) {
        request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $accessToken');
      }
      if (body != null) {
        request.write(jsonEncode(body));
      }

      final response = await request.close();
      final text = await response.transform(utf8.decoder).join();
      final decoded = text.isEmpty ? null : jsonDecode(text);

      if (response.statusCode < 200 || response.statusCode >= 300) {
        String message = 'حدث خطأ في الخادم (${response.statusCode})';
        if (decoded is Map) {
          if (decoded['message'] != null) {
            message = decoded['message'].toString();
          } else if (decoded['error'] != null) {
            message = decoded['error'].toString();
          } else if (decoded['errors'] != null) {
            message = decoded['errors'].toString();
          }
        }
        throw ApiException(message, response.statusCode);
      }

      return decoded;
    } on SocketException {
      throw ApiException('تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت ورابط الـ API.', 0);
    } on FormatException {
      throw ApiException('استجابة الخادم غير متوقعة.', 0);
    } finally {
      client.close(force: true);
    }
  }
}
