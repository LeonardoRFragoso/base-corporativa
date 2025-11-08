from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, EmailVerificationToken, PasswordResetToken,
    UserConsent, DataDeletionRequest, DataExportRequest
)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'email_verified', 'is_staff']
    list_filter = ['email_verified', 'is_staff', 'is_superuser', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Verificação', {'fields': ('email_verified',)}),
    )

@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'created_at', 'expires_at', 'used']
    list_filter = ['used', 'created_at']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['token', 'created_at', 'expires_at']

@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token', 'created_at', 'expires_at', 'used']
    list_filter = ['used', 'created_at']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['token', 'created_at', 'expires_at']


# ==================== LGPD ADMIN ====================

@admin.register(UserConsent)
class UserConsentAdmin(admin.ModelAdmin):
    list_display = ['user', 'consent_type', 'consent_given', 'consent_date', 'version', 'is_active', 'revoked_at']
    list_filter = ['consent_type', 'consent_given', 'consent_date', 'revoked_at']
    search_fields = ['user__email', 'user__username', 'ip_address']
    readonly_fields = ['consent_date', 'ip_address', 'user_agent']
    date_hierarchy = 'consent_date'
    
    fieldsets = (
        ('Informações do Consentimento', {
            'fields': ('user', 'consent_type', 'consent_given', 'version')
        }),
        ('Dados Técnicos', {
            'fields': ('ip_address', 'user_agent', 'consent_date')
        }),
        ('Revogação', {
            'fields': ('revoked_at', 'revoked_ip'),
            'classes': ('collapse',)
        }),
    )
    
    def is_active(self, obj):
        return obj.is_active
    is_active.boolean = True
    is_active.short_description = 'Ativo'


@admin.register(DataDeletionRequest)
class DataDeletionRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'request_date', 'status', 'processed_date', 'processed_by']
    list_filter = ['status', 'request_date', 'processed_date']
    search_fields = ['user__email', 'user__username', 'reason']
    readonly_fields = ['request_date', 'ip_address']
    date_hierarchy = 'request_date'
    
    fieldsets = (
        ('Solicitação', {
            'fields': ('user', 'request_date', 'ip_address', 'reason')
        }),
        ('Processamento', {
            'fields': ('status', 'processed_date', 'processed_by', 'notes')
        }),
    )
    
    actions = ['mark_as_processing', 'mark_as_completed']
    
    def mark_as_processing(self, request, queryset):
        updated = queryset.filter(status='pending').update(status='processing')
        self.message_user(request, f'{updated} solicitações marcadas como em processamento.')
    mark_as_processing.short_description = 'Marcar como em processamento'
    
    def mark_as_completed(self, request, queryset):
        from django.utils import timezone
        updated = 0
        for obj in queryset.filter(status__in=['pending', 'processing']):
            obj.complete(processed_by=request.user)
            updated += 1
        self.message_user(request, f'{updated} solicitações marcadas como concluídas.')
    mark_as_completed.short_description = 'Marcar como concluído'


@admin.register(DataExportRequest)
class DataExportRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'request_date', 'status', 'completed_date', 'download_count', 'is_expired']
    list_filter = ['status', 'request_date', 'completed_date']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['request_date', 'ip_address', 'expires_at', 'download_count']
    date_hierarchy = 'request_date'
    
    fieldsets = (
        ('Solicitação', {
            'fields': ('user', 'request_date', 'ip_address')
        }),
        ('Status', {
            'fields': ('status', 'completed_date', 'file_path')
        }),
        ('Download', {
            'fields': ('download_count', 'expires_at')
        }),
    )
    
    def is_expired(self, obj):
        return obj.is_expired()
    is_expired.boolean = True
    is_expired.short_description = 'Expirado'
