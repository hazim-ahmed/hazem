import 'dart:convert';
import 'dart:io';

import '../config/app_config.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient({required this.baseUrl, this.accessToken, this.refreshToken});

  String baseUrl;
  String? accessToken;
  String? refreshToken;

  Uri _uri(String path, [Map<String, String>? query]) {
    final cleanBase = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$cleanBase$cleanPath').replace(queryParameters: query);
  }

  Future<dynamic> get(String path, {Map<String, String>? query}) {
    return _request('GET', path, query: query);
  }

  Future<dynamic> post(String path, Map<String, dynamic> body) {
    return _request('POST', path, body: body);
  }

  Future<dynamic> patch(String path, Map<String, dynamic> body) {
    return _request('PATCH', path, body: body);
  }

  Future<dynamic> delete(String path) {
    return _request('DELETE', path);
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
        final message = decoded is Map
            ? decoded['message'] ?? decoded['error'] ?? 'حدث خطأ في الخادم (${response.statusCode})'
            : 'حدث خطأ في الخادم (${response.statusCode})';
        throw ApiException(message.toString(), response.statusCode);
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
