class AuthUser {
  final int id;
  final String username;
  final String fullName;
  final String? email;
  final String? employeeNumber;
  final List<String> roles;
  final List<String> permissions;

  AuthUser({
    required this.id,
    required this.username,
    required this.fullName,
    this.email,
    this.employeeNumber,
    required this.roles,
    this.permissions = const [],
  });

  bool get isAdmin => roles.any((r) => r.toUpperCase() == 'ADMIN');
  bool get isAccountant => roles.any((r) => r.toUpperCase() == 'ACCOUNTANT');
  bool get isManager => roles.any((r) => r.toUpperCase() == 'MANAGER');
  bool get canReviewExpenses =>
      isAdmin ||
      isAccountant ||
      isManager ||
      permissions.contains('transactions:approve') ||
      permissions.contains('transactions:reject');

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '') ?? 0,
      username: json['username']?.toString() ?? '',
      fullName: json['fullName']?.toString() ?? json['username']?.toString() ?? 'مستخدم',
      email: json['email']?.toString(),
      employeeNumber: json['employeeNumber']?.toString(),
      roles: (json['roles'] as List?)?.map((e) => e.toString()).toList() ?? [],
      permissions: (json['permissions'] as List?)?.map((e) => e.toString()).toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'username': username,
        'fullName': fullName,
        'email': email,
        'employeeNumber': employeeNumber,
        'roles': roles,
        'permissions': permissions,
      };
}
