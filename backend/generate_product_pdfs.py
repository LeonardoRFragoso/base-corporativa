"""
Script para gerar PDFs profissionais para todos os produtos
"""
import os
import django
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from catalog.models import Product
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from django.utils.text import slugify
from datetime import datetime

def create_product_pdf(product):
    """Cria PDF profissional para um produto"""
    
    # Criar diretório se não existir
    pdf_dir = Path('media/product_pdfs')
    pdf_dir.mkdir(parents=True, exist_ok=True)
    
    # Nome do arquivo
    filename = f"{slugify(product.name)}.pdf"
    filepath = pdf_dir / filename
    
    # Criar documento
    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    # Estilos
    styles = getSampleStyleSheet()
    
    # Estilo customizado para título
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Estilo para subtítulos
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#34495e'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    # Estilo para texto normal
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#2c3e50'),
        alignment=TA_JUSTIFY,
        spaceAfter=12
    )
    
    # Construir conteúdo
    story = []
    
    # Logo/Header (simulado com texto)
    header = Paragraph(
        "<b>BASE CORPORATIVA</b><br/><font size=10>Moda Corporativa de Qualidade</font>",
        ParagraphStyle(
            'Header',
            parent=styles['Normal'],
            fontSize=14,
            textColor=colors.HexColor('#2c3e50'),
            alignment=TA_CENTER,
            spaceAfter=20
        )
    )
    story.append(header)
    story.append(Spacer(1, 0.5*cm))
    
    # Linha separadora
    line_data = [['', '']]
    line_table = Table(line_data, colWidths=[17*cm])
    line_table.setStyle(TableStyle([
        ('LINEABOVE', (0, 0), (-1, 0), 2, colors.HexColor('#3498db')),
    ]))
    story.append(line_table)
    story.append(Spacer(1, 0.5*cm))
    
    # Título do produto
    story.append(Paragraph(product.name, title_style))
    
    # Informações básicas em tabela
    info_data = [
        ['<b>Código:</b>', f'#{product.id}'],
        ['<b>Categoria:</b>', product.category.name if product.category else 'N/A'],
        ['<b>Preço Base:</b>', f'R$ {product.base_price:.2f}'],
    ]
    
    info_table = Table(info_data, colWidths=[5*cm, 12*cm])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ecf0f1')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#2c3e50')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bdc3c7'))
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.5*cm))
    
    # Descrição
    if product.description:
        story.append(Paragraph('<b>Descrição do Produto</b>', subtitle_style))
        story.append(Paragraph(product.description, normal_style))
        story.append(Spacer(1, 0.3*cm))
    
    # Composição
    if product.composition:
        story.append(Paragraph('<b>Composição</b>', subtitle_style))
        story.append(Paragraph(product.composition, normal_style))
        story.append(Spacer(1, 0.3*cm))
    
    # Tipo de tecido
    if product.fabric_type:
        story.append(Paragraph('<b>Tipo de Tecido</b>', subtitle_style))
        story.append(Paragraph(product.fabric_type, normal_style))
        story.append(Spacer(1, 0.3*cm))
    
    # Instruções de cuidado
    if product.care_instructions:
        story.append(Paragraph('<b>Instruções de Cuidado</b>', subtitle_style))
        story.append(Paragraph(product.care_instructions, normal_style))
        story.append(Spacer(1, 0.3*cm))
    
    # Variantes (se houver)
    variants = product.variants.all()
    if variants.exists():
        story.append(Spacer(1, 0.5*cm))
        story.append(Paragraph('<b>Variantes Disponíveis</b>', subtitle_style))
        
        variant_data = [['<b>Cor</b>', '<b>Tamanho</b>', '<b>Preço</b>', '<b>Estoque</b>']]
        
        for variant in variants:
            variant_data.append([
                variant.color or '-',
                variant.size or '-',
                f'R$ {variant.price:.2f}',
                str(variant.stock)
            ])
        
        variant_table = Table(variant_data, colWidths=[4*cm, 4*cm, 4*cm, 5*cm])
        variant_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498db')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#ecf0f1')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bdc3c7')),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ]))
        story.append(variant_table)
    
    # Footer
    story.append(Spacer(1, 2*cm))
    footer_text = f"""
    <para align=center>
    <font size=8 color="#7f8c8d">
    Documento gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')}<br/>
    BASE CORPORATIVA - www.basecorporativa.store<br/>
    contato@basecorporativa.store
    </font>
    </para>
    """
    story.append(Paragraph(footer_text, styles['Normal']))
    
    # Gerar PDF
    doc.build(story)
    
    return filepath

def main():
    print("🎨 Gerador de PDFs de Produtos - BASE CORPORATIVA")
    print("=" * 80)
    print()
    
    # Buscar todos os produtos ativos
    products = Product.objects.filter(is_active=True)
    total = products.count()
    
    print(f"📦 Total de produtos ativos: {total}")
    print()
    
    if total == 0:
        print("⚠️  Nenhum produto ativo encontrado.")
        return
    
    print("🔄 Gerando PDFs...")
    print("-" * 80)
    
    success_count = 0
    error_count = 0
    
    for i, product in enumerate(products, 1):
        try:
            filepath = create_product_pdf(product)
            
            # Atualizar campo catalog_pdf no produto
            relative_path = f"product_pdfs/{filepath.name}"
            product.catalog_pdf = relative_path
            product.save(update_fields=['catalog_pdf'])
            
            print(f"✅ [{i}/{total}] {product.name}")
            print(f"   📄 Arquivo: {filepath.name}")
            print(f"   💾 Salvo em: {relative_path}")
            print()
            
            success_count += 1
            
        except Exception as e:
            print(f"❌ [{i}/{total}] ERRO ao gerar PDF para {product.name}")
            print(f"   Erro: {str(e)}")
            print()
            error_count += 1
    
    print("-" * 80)
    print()
    print("📊 RESUMO:")
    print(f"   ✅ Sucesso: {success_count}")
    print(f"   ❌ Erros: {error_count}")
    print(f"   📦 Total: {total}")
    print()
    
    if success_count > 0:
        print("🎉 PDFs gerados com sucesso!")
        print()
        print("📁 Localização: backend/media/product_pdfs/")
        print()
        print("🚀 Próximos passos:")
        print("   1. Fazer upload dos PDFs para o R2 (se em produção)")
        print("   2. Verificar os PDFs gerados")
        print("   3. Testar as URLs no frontend")
    
    print()
    print("✅ Processo concluído!")

if __name__ == '__main__':
    main()
