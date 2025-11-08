# Timestamp Fix for Element Creation

## Problem
When creating elements (text, shapes, images), the API was returning a 500 error:
```
IntegrityError: (1048, "Column 'created_at' cannot be null")
```

## Root Cause
Django models have `managed = False` because we're using an existing database schema. When `managed = False`, Django doesn't automatically populate `auto_now` and `auto_now_add` fields, so timestamp fields were being set to NULL.

## Solution
Override the `create()` and `update()` methods in ALL serializers to manually set timestamp fields using `timezone.now()`.

## Files Modified

### api/presentation_serializers.py

Updated the following serializers with manual timestamp handling:

1. **ElementSerializer** - Main fix for element creation
   - Added `create()` method to set `created_at` and `updated_at`
   - Added `update()` method to set `updated_at`

2. **FrameSerializer**
   - Added `create()` method to set `created_at` and `updated_at`
   - Added `update()` method to set `updated_at`

3. **BrandKitSerializer**
   - Updated `create()` to set `created_at` and `updated_at`
   - Added `update()` method to set `updated_at`

4. **AssetSerializer**
   - Updated `create()` to set `created_at`

5. **PresentationTemplateSerializer**
   - Updated `create()` to set `created_at`

6. **CommentSerializer**
   - Updated `create()` to set `created_at` and `updated_at`
   - Added `update()` method to set `updated_at`

7. **PresentationAccessSerializer**
   - Updated `create()` to set `granted_at`

8. **PresentationSerializer**
   - Updated `create()` to set `created_at` and `updated_at`
   - Added `update()` method to set `updated_at`

9. **PresentationVersionSerializer**
   - Updated `create()` to set `created_at`

10. **RecordingSerializer**
    - Updated `create()` to set `created_at`

## Example Implementation

```python
from django.utils import timezone

class ElementSerializer(serializers.ModelSerializer):
    # ... existing code ...

    def create(self, validated_data):
        # Set timestamps manually since managed=False doesn't auto-populate them
        validated_data['created_at'] = timezone.now()
        validated_data['updated_at'] = timezone.now()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Update the timestamp manually
        validated_data['updated_at'] = timezone.now()
        return super().update(instance, validated_data)
```

## Testing

After this fix, element creation should work properly:

1. Click "Text" button in toolbar → Text element should appear
2. Click "Rectangle" or "Circle" → Shape should appear
3. Drag & drop image from Assets panel → Image should appear
4. Drag & drop image file from desktop → Image should appear

All operations should now succeed without IntegrityError.
