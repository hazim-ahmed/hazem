Map<String, dynamic> asMap(dynamic value) {
  if (value is Map<String, dynamic>) return value;
  if (value is Map) return Map<String, dynamic>.from(value);
  return {};
}

List<Map<String, dynamic>> asList(dynamic value) {
  if (value is List) {
    return value.map((item) => asMap(item)).toList();
  }
  return [];
}

dynamic responseData(dynamic response) {
  final root = asMap(response);
  return root.containsKey('data') ? root['data'] : response;
}
