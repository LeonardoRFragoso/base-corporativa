from django.core.management.base import BaseCommand
from giftcards.models import GiftCardDesign


class Command(BaseCommand):
    help = 'Cria designs iniciais de gift cards'

    def handle(self, *args, **options):
        self.stdout.write("🎨 Criando designs de gift cards...")

        designs = [
            {
                'name': 'Vale Presente',
                'description': 'Design padrão para qualquer ocasião',
                'occasion': 'generic',
                'is_active': True,
                'is_default': True
            },
            {
                'name': 'Aniversário Especial',
                'description': 'Para celebrar um dia especial',
                'occasion': 'birthday',
                'is_active': True,
                'is_default': False
            },
            {
                'name': 'Feliz Natal',
                'description': 'Presente de Natal',
                'occasion': 'christmas',
                'is_active': True,
                'is_default': False
            },
            {
                'name': 'Dia das Mães',
                'description': 'Homenagem especial para mamãe',
                'occasion': 'mothers_day',
                'is_active': True,
                'is_default': False
            },
            {
                'name': 'Dia dos Pais',
                'description': 'Presente para o papai',
                'occasion': 'fathers_day',
                'is_active': True,
                'is_default': False
            },
            {
                'name': 'Dia dos Namorados',
                'description': 'Para quem você ama',
                'occasion': 'valentines',
                'is_active': True,
                'is_default': False
            }
        ]

        created = 0
        for design_data in designs:
            design, created_now = GiftCardDesign.objects.get_or_create(
                name=design_data['name'],
                defaults=design_data
            )
            if created_now:
                created += 1
                self.stdout.write(self.style.SUCCESS(f"  ✅ Criado: {design.name}"))
            else:
                self.stdout.write(self.style.WARNING(f"  ⚠️  Já existe: {design.name}"))

        self.stdout.write(self.style.SUCCESS(f"\n🎉 Concluído! {created} designs criados."))
        self.stdout.write(f"📊 Total de designs: {GiftCardDesign.objects.count()}")
