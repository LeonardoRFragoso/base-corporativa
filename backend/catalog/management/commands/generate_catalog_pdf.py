import os
from django.core.management.base import BaseCommand
from django.conf import settings
from catalog.models import Product
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from reportlab.pdfbase.pdfmetrics import stringWidth
from PIL import Image as PILImage


def _wrap(text, font_name, font_size, max_width):
    if not text:
        return []
    words = str(text).split()
    lines = []
    current = ""
    for w in words:
        test = (current + (" " if current else "") + w).strip()
        if stringWidth(test, font_name, font_size) <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = w
    if current:
        lines.append(current)
    return lines


class Command(BaseCommand):
    help = "Generate aggregated catalog PDF with images for all products"

    def handle(self, *args, **options):
        output_dir = os.path.join(settings.MEDIA_ROOT, "catalog")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, "catalogo.pdf")

        page_w, page_h = A4
        margin = 2 * cm
        c = canvas.Canvas(output_path, pagesize=A4)

        y = page_h - margin
        c.setFont("Helvetica-Bold", 22)
        c.drawString(margin, y, "Catálogo de Produtos")
        y -= 1.5 * cm

        products = (
            Product.objects.filter(is_active=True)
            .select_related("category")
            .prefetch_related("images")
            .order_by("category__name", "name")
        )

        img_box = 6 * cm
        gap = 1.0 * cm

        for p in products:
            img = p.images.filter(is_primary=True).first() or p.images.order_by("sort_order", "id").first()

            left_x = margin
            img_h = 0
            if img and getattr(img, "image", None):
                try:
                    img_path = img.image.path
                    with PILImage.open(img_path) as im:
                        iw, ih = im.size
                        ratio = min(img_box / iw, img_box / ih)
                        dw, dh = iw * ratio, ih * ratio
                    c.drawImage(img_path, left_x, y - dh, width=dw, height=dh, preserveAspectRatio=True, mask="auto")
                    img_h = dh
                except Exception:
                    img_h = 0

            text_x = left_x + (img_box + 0.8 * cm if img_h else 0)
            text_w = page_w - margin - text_x

            c.setFont("Helvetica-Bold", 14)
            c.drawString(text_x, y, p.name)
            y_line = y - 16

            c.setFont("Helvetica", 11)
            if p.category:
                c.drawString(text_x, y_line, f"Categoria: {p.category.name}")
                y_line -= 14
            c.drawString(text_x, y_line, f"Preço base: R$ {p.base_price}")
            y_line -= 16

            for line in _wrap(p.description or "", "Helvetica", 11, text_w)[:6]:
                c.drawString(text_x, y_line, line)
                y_line -= 14

            block_h = max(img_h, (y - y_line))
            y -= block_h + gap

            if y < margin + 6 * cm:
                c.showPage()
                y = page_h - margin

        c.showPage()
        c.save()

        self.stdout.write(output_path)
