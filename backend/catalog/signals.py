from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Product, ProductImage
from .pdf import generate_product_pdf


@receiver(post_save, sender=Product)
def generate_pdf_on_product_save(sender, instance: Product, created, **kwargs):
    try:
        relative_path = generate_product_pdf(instance)
        if instance.catalog_pdf.name != relative_path:
            Product.objects.filter(pk=instance.pk).update(catalog_pdf=relative_path)
    except Exception:
        # Intencionalmente ignorado para não quebrar o fluxo de save
        pass


@receiver(post_save, sender=ProductImage)
def regenerate_pdf_on_image_save(sender, instance: ProductImage, created, **kwargs):
    try:
        product = instance.product
        relative_path = generate_product_pdf(product)
        if product.catalog_pdf.name != relative_path:
            Product.objects.filter(pk=product.pk).update(catalog_pdf=relative_path)
    except Exception:
        pass
