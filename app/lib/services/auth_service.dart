import '../core/network/api_client.dart';
import '../core/storage/cache_service.dart';
import '../core/utils/response_helpers.dart';
import '../models/auth_user.dart';

class AuthService {
  final ApiClient api;

  AuthService(this.api);

  Future<AuthUser> login(String username, String password) async {
    final response = await api.post('/auth/login', {
      'username': username.trim(),
      'password': password,
    });

    final data = asMap(responseData(response));
    final tokens = asMap(data['tokens']);
    final userJson = asMap(data['user']);

    final accessToken = tokens['accessToken']?.toString() ?? '';
    final refreshToken = tokens['refreshToken']?.toString() ?? '';

    if (accessToken.isEmpty) {
      throw Exception('لم يتم استلام رمز دخول صالح من الخادم.');
    }

    api.accessToken = accessToken;
    api.refreshToken = refreshToken;

    await CacheService.saveAuthSession(
      baseUrl: api.baseUrl,
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: userJson,
    );

    return AuthUser.fromJson(userJson);
  }

  Future<void> logout() async {
    await CacheService.clearAuthSession();
  }
}
