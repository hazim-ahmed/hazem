class MasterItem {
  final int id;
  final String name;
  final String? subtitle;

  MasterItem({required this.id, required this.name, this.subtitle});
}

class ProjectUnitItem {
  final int id;
  final String unitNumber;
  final String? unitType;

  ProjectUnitItem({required this.id, required this.unitNumber, this.unitType});

  factory ProjectUnitItem.fromJson(Map<String, dynamic> json) {
    return ProjectUnitItem(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '') ?? 0,
      unitNumber: json['unitNumber']?.toString() ?? '',
      unitType: json['unitType']?.toString(),
    );
  }
}
