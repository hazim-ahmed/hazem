import 'package:flutter/material.dart';
import '../../../models/master_models.dart';

class CustomDropdownField extends StatelessWidget {
  final String label;
  final IconData icon;
  final int? value;
  final List<MasterItem> items;
  final ValueChanged<int?> onChanged;
  final bool includeNullOption;
  final String? Function(int?)? validator;

  const CustomDropdownField({
    super.key,
    required this.label,
    required this.icon,
    required this.value,
    required this.items,
    required this.onChanged,
    this.includeNullOption = false,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<int?>(
      initialValue: value,
      isExpanded: true,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: const Color(0xFF0F766E)),
      ),
      items: [
        if (includeNullOption)
          const DropdownMenuItem<int?>(
            value: null,
            child: Text('— بدون تحديد —', style: TextStyle(color: Colors.grey)),
          ),
        ...items.map((item) {
          return DropdownMenuItem<int?>(
            value: item.id,
            child: Text(
              item.subtitle != null ? '${item.name} (${item.subtitle})' : item.name,
              overflow: TextOverflow.ellipsis,
            ),
          );
        }),
      ],
      onChanged: onChanged,
      validator: validator,
    );
  }
}
