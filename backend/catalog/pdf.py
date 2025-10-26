import os
from django.conf import settings
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.pdfbase.pdfmetrics import stringWidth
from PIL import Image as PILImage
from reportlab.lib.utils import ImageReader
from django.core.files.storage import default_storage


def _wrap_text(text, font_name, font_size, max_width):
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


def generate_product_pdf(product):
    output_dir = os.path.join(settings.MEDIA_ROOT, 'product_pdfs')
    os.makedirs(output_dir, exist_ok=True)
    filename = f"{product.slug}.pdf"
    output_path = os.path.join(output_dir, filename)

    page_w, page_h = A4
    margin = 2 * cm
    c = canvas.Canvas(output_path, pagesize=A4)

    y = page_h - margin

    title = product.name
    c.setFont("Helvetica-Bold", 20)
    c.drawString(margin, y, title)
    y -= 1.2 * cm

    c.setFont("Helvetica", 12)
    if product.category:
        c.drawString(margin, y, f"Categoria: {product.category.name}")
        y -= 0.8 * cm

    c.drawString(margin, y, f"Preço base: R$ {product.base_price}")
    y -= 1.0 * cm

    primary_img = getattr(product, 'images', None)
    img_obj = None
    if primary_img is not None:
        img_obj = primary_img.filter(is_primary=True).first() or primary_img.order_by('sort_order', 'id').first()

    img_w = 8 * cm
    img_h = 8 * cm
    if img_obj and getattr(img_obj, 'image', None):
        try:
            source = None
            if hasattr(img_obj.image, 'path'):
                source = img_obj.image.path
                with PILImage.open(source) as im:
                    iw, ih = im.size
            else:
                with default_storage.open(img_obj.image.name, 'rb') as f:
                    with PILImage.open(f) as im:
                        iw, ih = im.size
                    f.seek(0)
                    source = ImageReader(f)

            ratio = min(img_w / iw, img_h / ih)
            dw, dh = iw * ratio, ih * ratio
            c.drawImage(source, margin, y - dh, width=dw, height=dh, preserveAspectRatio=True, mask='auto')
            img_block_h = dh
        except Exception:
            img_block_h = 0
    else:
        img_block_h = 0

    text_x = margin + (img_w + 1 * cm if img_block_h else 0)
    text_width = page_w - margin - text_x

    c.setFont("Helvetica", 12)
    lines = _wrap_text(product.description or "", "Helvetica", 12, text_width)
    ty = y
    for line in lines[:40]:
        c.drawString(text_x, ty, line)
        ty -= 14

    block_h = max(img_block_h, (y - ty))
    y -= block_h + 1.2 * cm

    info_pairs = []
    if product.fabric_type:
        info_pairs.append(("Tecido", product.fabric_type))
    if product.composition:
        info_pairs.append(("Composição", product.composition))
    if product.care_instructions:
        info_pairs.append(("Cuidados", product.care_instructions))

    for label, value in info_pairs:
        c.setFont("Helvetica-Bold", 12)
        c.drawString(margin, y, f"{label}:")
        c.setFont("Helvetica", 12)
        txt_lines = _wrap_text(str(value), "Helvetica", 12, page_w - 2 * margin)
        y -= 14
        for line in txt_lines[:40]:
            c.drawString(margin, y, line)
            y -= 14
        y -= 6

    c.setFont("Helvetica", 10)
    c.drawString(margin, 1.2 * cm, "Gerado automaticamente pela BASE CORPORATIVA")

    c.showPage()
    c.save()

    return os.path.join('product_pdfs', filename)
