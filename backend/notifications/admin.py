from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'type', 'read', 'created_at')
    list_filter = ('type', 'read', 'created_at')
    search_fields = ('title', 'message', 'user__email')
    readonly_fields = ('created_at',)
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        updated = queryset.update(read=True)
        self.message_user(request, f'{updated} notificação(ões) marcada(s) como lida(s).')
    mark_as_read.short_description = "Marcar como lida"
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(read=False)
        self.message_user(request, f'{updated} notificação(ões) marcada(s) como não lida(s).')
    mark_as_unread.short_description = "Marcar como não lida"
