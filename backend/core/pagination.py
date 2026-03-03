"""
Sistema de paginação otimizado para o e-commerce
Implementa paginação com cursor e performance melhorada
"""

from rest_framework.pagination import PageNumberPagination, CursorPagination
from rest_framework.response import Response
from collections import OrderedDict


class StandardResultsSetPagination(PageNumberPagination):
    """
    Paginação padrão otimizada para listagens
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('results', data)
        ]))


class ProductPagination(PageNumberPagination):
    """
    Paginação específica para produtos
    Otimizada para catálogo com mais itens por página
    """
    page_size = 24  # Múltiplo de 3, 4 e 6 para grids responsivos
    page_size_query_param = 'page_size'
    max_page_size = 48
    
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.page_size),
            ('results', data)
        ]))


class OptimizedCursorPagination(CursorPagination):
    """
    Paginação com cursor para feeds infinitos
    Mais eficiente para grandes datasets
    """
    page_size = 20
    ordering = '-created_at'
    cursor_query_param = 'cursor'
    
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('results', data)
        ]))


class ReviewPagination(PageNumberPagination):
    """
    Paginação para reviews
    Menos itens por página para melhor UX
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class OrderPagination(PageNumberPagination):
    """
    Paginação para pedidos
    """
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 50
    
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('results', data)
        ]))
