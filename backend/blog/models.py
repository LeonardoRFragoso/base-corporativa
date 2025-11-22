from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone


class BlogCategory(models.Model):
    """
    Categoria de posts do blog
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    meta_description = models.CharField(max_length=160, blank=True, help_text="SEO meta description")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Categoria do Blog'
        verbose_name_plural = 'Categorias do Blog'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class BlogPost(models.Model):
    """
    Post do blog para SEO e conteúdo
    """
    STATUS_CHOICES = [
        ('draft', 'Rascunho'),
        ('published', 'Publicado'),
        ('scheduled', 'Agendado'),
    ]

    # Básico
    title = models.CharField(max_length=200, help_text="Título do post")
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='blog_posts')
    category = models.ForeignKey(BlogCategory, on_delete=models.SET_NULL, null=True, related_name='posts')
    
    # Conteúdo
    excerpt = models.TextField(max_length=300, help_text="Resumo curto do post (até 300 caracteres)")
    content = models.TextField(help_text="Conteúdo completo em HTML ou Markdown")
    featured_image = models.ImageField(upload_to='blog/', blank=True, null=True)
    featured_image_alt = models.CharField(max_length=200, blank=True, help_text="Texto alternativo para a imagem")
    
    # SEO
    meta_title = models.CharField(max_length=70, blank=True, help_text="Título SEO (deixe vazio para usar o título do post)")
    meta_description = models.CharField(max_length=160, blank=True, help_text="Descrição SEO (até 160 caracteres)")
    meta_keywords = models.CharField(max_length=255, blank=True, help_text="Palavras-chave separadas por vírgula")
    canonical_url = models.URLField(blank=True, help_text="URL canônica (opcional)")
    
    # Status e datas
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    published_at = models.DateTimeField(null=True, blank=True)
    scheduled_for = models.DateTimeField(null=True, blank=True, help_text="Data/hora para publicação agendada")
    
    # Analytics
    view_count = models.PositiveIntegerField(default=0)
    reading_time_minutes = models.PositiveIntegerField(default=5, help_text="Tempo estimado de leitura")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Relacionamentos
    related_products = models.ManyToManyField('catalog.Product', blank=True, related_name='blog_posts')
    tags = models.ManyToManyField('BlogTag', blank=True, related_name='posts')

    class Meta:
        verbose_name = 'Post do Blog'
        verbose_name_plural = 'Posts do Blog'
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['status', 'published_at']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Gerar slug automaticamente
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Auto-publicar se status mudou para published
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        
        # Calcular tempo de leitura (aproximadamente 200 palavras por minuto)
        if self.content:
            word_count = len(self.content.split())
            self.reading_time_minutes = max(1, word_count // 200)
        
        # Usar título como meta_title se vazio
        if not self.meta_title:
            self.meta_title = self.title[:70]
        
        # Usar excerpt como meta_description se vazio
        if not self.meta_description and self.excerpt:
            self.meta_description = self.excerpt[:160]
        
        super().save(*args, **kwargs)

    def increment_view_count(self):
        """Incrementa contador de visualizações"""
        self.view_count += 1
        self.save(update_fields=['view_count'])

    @property
    def is_published(self):
        """Verifica se o post está publicado"""
        return self.status == 'published' and self.published_at and self.published_at <= timezone.now()

    def get_absolute_url(self):
        """Retorna URL do post"""
        return f'/blog/{self.slug}'


class BlogTag(models.Model):
    """
    Tags para posts do blog
    """
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)
    
    class Meta:
        verbose_name = 'Tag do Blog'
        verbose_name_plural = 'Tags do Blog'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class BlogComment(models.Model):
    """
    Comentários em posts do blog
    """
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('approved', 'Aprovado'),
        ('spam', 'Spam'),
    ]

    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    author_name = models.CharField(max_length=100, blank=True)
    author_email = models.EmailField(blank=True)
    content = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Comentário do Blog'
        verbose_name_plural = 'Comentários do Blog'
        ordering = ['-created_at']

    def __str__(self):
        return f'Comentário de {self.author_name or self.author} em {self.post.title}'


class BlogNewsletter(models.Model):
    """
    Inscrições na newsletter do blog
    """
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Inscrição na Newsletter'
        verbose_name_plural = 'Inscrições na Newsletter'
        ordering = ['-subscribed_at']

    def __str__(self):
        return self.email
