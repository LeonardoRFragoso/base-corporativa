from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum, Count, Avg
from django.urls import reverse
from .models import Category, Product, ProductVariant, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}
    list_display = ("id", "name", "slug", "products_count")
    search_fields = ("name", "slug", "description")
    
    def products_count(self, obj):
        count = obj.products.count()
        return format_html('<strong>{}</strong> produtos', count)
    products_count.short_description = "Total de Produtos"


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ('size', 'color', 'sku', 'price', 'stock', 'is_default', 'stock_status')
    readonly_fields = ('stock_status',)
    
    def stock_status(self, obj):
        if not obj.id:
            return "-"
        if obj.stock == 0:
            return format_html('<span style="color: red; font-weight: bold;">SEM ESTOQUE</span>')
        elif obj.stock < 5:
            return format_html('<span style="color: orange; font-weight: bold;">ESTOQUE BAIXO</span>')
        else:
            return format_html('<span style="color: green;">OK</span>')
    stock_status.short_description = "Status"


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'variant', 'alt_text', 'is_primary', 'sort_order', 'image_preview')
    readonly_fields = ('image_preview',)
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 50px; max-width: 100px;" />', obj.image.url)
        return "-"
    image_preview.short_description = "Preview"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}
    list_display = ("id", "name", "category", "base_price_display", "total_stock", "variants_count", "is_active", "created_at")
    list_filter = ("category", "is_active", "fabric_type", "created_at")
    search_fields = ("name", "slug", "description")
    inlines = [ProductVariantInline, ProductImageInline]
    date_hierarchy = 'created_at'
    actions = ['activate_products', 'deactivate_products']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'slug', 'category', 'is_active')
        }),
        ('Descrição', {
            'fields': ('description', 'fabric_type', 'composition', 'care_instructions')
        }),
        ('Preço e Catálogo', {
            'fields': ('base_price', 'catalog_pdf')
        }),
        ('Datas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')
    
    def base_price_display(self, obj):
        return f"R$ {obj.base_price:.2f}"
    base_price_display.short_description = "Preço Base"
    base_price_display.admin_order_field = "base_price"
    
    def total_stock(self, obj):
        total = obj.variants.aggregate(total=Sum('stock'))['total'] or 0
        if total == 0:
            return format_html('<span style="color: red; font-weight: bold;">{}</span>', total)
        elif total < 10:
            return format_html('<span style="color: orange; font-weight: bold;">{}</span>', total)
        return format_html('<span style="color: green; font-weight: bold;">{}</span>', total)
    total_stock.short_description = "Estoque Total"
    
    def variants_count(self, obj):
        return obj.variants.count()
    variants_count.short_description = "Variantes"
    
    def activate_products(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} produto(s) ativado(s) com sucesso.')
    activate_products.short_description = "Ativar produtos selecionados"
    
    def deactivate_products(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} produto(s) desativado(s) com sucesso.')
    deactivate_products.short_description = "Desativar produtos selecionados"
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('category').prefetch_related('variants')


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ("id", "product_link", "size", "color", "sku", "price_display", "stock_badge", "is_default")
    list_filter = ("size", "is_default", "product__category")
    search_fields = ("sku", "product__name", "color")
    list_editable = ("stock",)
    
    def product_link(self, obj):
        url = reverse('admin:catalog_product_change', args=[obj.product.id])
        return format_html('<a href="{}">{}</a>', url, obj.product.name)
    product_link.short_description = "Produto"
    
    def price_display(self, obj):
        price = obj.price or obj.product.base_price
        return f"R$ {price:.2f}"
    price_display.short_description = "Preço"
    
    def stock_badge(self, obj):
        if obj.stock == 0:
            return format_html(
                '<span style="background-color: #dc3545; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
                obj.stock
            )
        elif obj.stock < 5:
            return format_html(
                '<span style="background-color: #FFA500; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
                obj.stock
            )
        return format_html(
            '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            obj.stock
        )
    stock_badge.short_description = "Estoque"


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "variant", "image_preview", "is_primary", "sort_order")
    list_filter = ("is_primary", "product__category")
    search_fields = ("product__name", "alt_text")
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 50px; max-width: 100px;" />', obj.image.url)
        return "-"
    image_preview.short_description = "Preview"
