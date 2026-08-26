import '../core/network/api_client.dart';
import '../core/storage/cache_service.dart';
import '../core/utils/response_helpers.dart';
import '../models/master_models.dart';

class MasterDataService {
  final ApiClient api;

  MasterDataService(this.api);

  Future<Map<String, List<MasterItem>>> fetchMasterData() async {
    final results = await Future.wait([
      api.get('/beneficiaries'),
      api.get('/expense-categories'),
      api.get('/projects', query: {'activeOnly': 'true'}),
      api.get('/payment-methods'),
    ]);

    final benRaw = asList(responseData(results[0]));
    final catRaw = asList(responseData(results[1]));
    final prjRaw = asList(responseData(results[2]));
    final payRaw = asList(responseData(results[3]));

    await CacheService.saveCachedData('master_data_raw', {
      'beneficiaries': benRaw,
      'categories': catRaw,
      'projects': prjRaw,
      'paymentMethods': payRaw,
    });

    return {
      'beneficiaries': benRaw.map((e) => MasterItem(id: e['id'], name: e['name'] ?? e['commercialName'] ?? '')).toList(),
      'categories': catRaw.map((e) => MasterItem(id: e['id'], name: e['name'] ?? '')).toList(),
      'projects': prjRaw.map((e) => MasterItem(id: e['id'], name: e['projectName'] ?? e['name'] ?? '', subtitle: e['projectCode'])).toList(),
      'paymentMethods': payRaw.map((e) => MasterItem(id: e['id'], name: e['name'] ?? e['code'] ?? '')).toList(),
    };
  }

  Future<List<ProjectUnitItem>> fetchUnitsForProject(int projectId) async {
    final res = await api.get('/projects/$projectId/units');
    final raw = asList(responseData(res));
    return raw.map((e) => ProjectUnitItem.fromJson(e)).toList();
  }
}
