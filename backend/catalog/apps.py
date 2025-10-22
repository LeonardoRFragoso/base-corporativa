from django.apps import AppConfig


class CatalogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'catalog'

    def ready(self):
        # Importa sinais que geram/regeneram PDFs de produtos
        import catalog.signals  # noqa: F401
