import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.shortcuts import redirect
from django.utils import timezone
from datetime import timedelta
from .models import CarrierToken


def _normalize_cep(cep: str) -> str:
    if not cep:
        return ''
    return cep.replace('-', '').replace('.', '').strip()


def _item_to_product(item):
    # Map frontend cart item to Melhor Envio product payload
    weight_g = item.get('weight_grams') or settings.SHIPPING_DEFAULT_WEIGHT_GRAMS
    height_cm = item.get('height_cm') or settings.SHIPPING_DEFAULT_HEIGHT_CM
    width_cm = item.get('width_cm') or settings.SHIPPING_DEFAULT_WIDTH_CM
    length_cm = item.get('length_cm') or settings.SHIPPING_DEFAULT_LENGTH_CM
    qty = int(item.get('qty') or 1)
    sku = str(item.get('variantId') or item.get('id') or 'SKU')
    return {
        'id': sku,
        'weight': max(0.05, float(weight_g) / 1000.0),  # kg
        'height': int(height_cm),
        'width': int(width_cm),
        'length': int(length_cm),
        'quantity': qty,
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def quote(request):
    """
    Calculate real shipping quotes using Melhor Envio API.
    Request body:
    {
      "zip_destination": "88058-001",
      "items": [{ id, variantId, qty, weight_grams?, length_cm?, width_cm?, height_cm? }]
    }
    """
    token = _get_bearer_token()
    if not token:
        return Response({'error': 'Conta do Melhor Envio não autenticada. Acesse /api/shipping/oauth/start para conectar.'}, status=status.HTTP_401_UNAUTHORIZED)

    origin_zip = settings.SHIPPING_ORIGIN_ZIP
    dest_zip = request.data.get('zip_destination')
    items = request.data.get('items') or []

    if not dest_zip:
        return Response({'error': 'zip_destination é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
    if not isinstance(items, list) or not items:
        return Response({'error': 'items deve ser uma lista com ao menos 1 item'}, status=status.HTTP_400_BAD_REQUEST)

    products = [_item_to_product(i) for i in items]

    url = f"{settings.MELHORENVIO_API_BASE}/api/v2/me/shipment/calculate"
    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
    payload = {
        'from': { 'postal_code': _normalize_cep(origin_zip) },
        'to': { 'postal_code': _normalize_cep(dest_zip) },
        'products': products,
        'options': {
            'receipt': False,
            'own_hand': False,
            'non_commercial': True,
            'reverse': False,
            'insurance_value': 0,
        },
        # 'services': ''  # empty = return all available
    }

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=20)
    except requests.RequestException as e:
        return Response({'error': 'Falha ao consultar Melhor Envio', 'details': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    if resp.status_code >= 400:
        return Response({'error': 'Erro na API do Melhor Envio', 'status': resp.status_code, 'response': resp.text}, status=status.HTTP_502_BAD_GATEWAY)

    data = resp.json()
    # Normalize response
    quotes = []
    for opt in data:
        quotes.append({
            'service_id': opt.get('id'),
            'service_name': opt.get('name'),
            'carrier': (opt.get('company') or {}).get('name'),
            'carrier_logo': (opt.get('company') or {}).get('picture'),
            'price': float(opt.get('price') or opt.get('custom_price') or 0),
            'delivery_time': (opt.get('delivery_time') or {}).get('days') or opt.get('delivery_range') or None,
        })

    # Apply free shipping threshold if configured
    total_products_value = sum((float(i.get('price') or 0) * int(i.get('qty') or 1)) for i in items)
    if settings.SHIPPING_FREE_THRESHOLD and total_products_value >= settings.SHIPPING_FREE_THRESHOLD:
        for q in quotes:
            q['price'] = 0.0

    return Response({'origin_zip': origin_zip, 'destination_zip': dest_zip, 'quotes': quotes})


# ====== OAuth helpers & endpoints ======
def _store_token(token_data: dict):
    expires_in = int(token_data.get('expires_in', 0))
    expires_at = timezone.now() + timedelta(seconds=max(0, expires_in - 60)) if expires_in else None
    CarrierToken.objects.update_or_create(
        provider='melhor_envio',
        defaults={
            'access_token': token_data.get('access_token', ''),
            'refresh_token': token_data.get('refresh_token', ''),
            'token_type': token_data.get('token_type', 'Bearer'),
            'scope': token_data.get('scope'),
            'expires_at': expires_at,
        }
    )


def _get_bearer_token() -> str | None:
    # Prefer OAuth stored token
    try:
        ct = CarrierToken.objects.filter(provider='melhor_envio').first()
        if ct and not ct.is_expired:
            return ct.access_token
        if ct and ct.refresh_token:
            refreshed = _refresh_token(ct.refresh_token)
            if refreshed:
                return refreshed
    except Exception:
        pass
    # Fallback to static token from env for development
    env_token = getattr(settings, 'MELHORENVIO_API_TOKEN', '')
    return env_token or None


def _refresh_token(refresh_token: str) -> str | None:
    token_url = f"{settings.MELHORENVIO_AUTH_BASE}/oauth/token"
    payload = {
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': settings.MELHORENVIO_CLIENT_ID,
        'client_secret': settings.MELHORENVIO_CLIENT_SECRET,
    }
    try:
        resp = requests.post(token_url, data=payload, headers={'Accept': 'application/json'}, timeout=20)
        if resp.status_code >= 400:
            return None
        data = resp.json()
        _store_token(data)
        return data.get('access_token')
    except requests.RequestException:
        return None


@api_view(['GET'])
@permission_classes([AllowAny])
def oauth_start(request):
    """Redirects user to Melhor Envio authorize page."""
    authorize_url = f"{settings.MELHORENVIO_AUTH_BASE}/oauth/authorize"
    params = {
        'client_id': settings.MELHORENVIO_CLIENT_ID,
        'redirect_uri': settings.MELHORENVIO_REDIRECT_URI,
        'response_type': 'code',
        'scope': 'read,write',
    }
    # Build URL manually to avoid external deps
    query = '&'.join([f"{k}={requests.utils.quote(str(v))}" for k, v in params.items()])
    return redirect(f"{authorize_url}?{query}")


@api_view(['GET'])
@permission_classes([AllowAny])
def oauth_callback(request):
    """Handles Melhor Envio OAuth callback, exchanges code for tokens and stores them."""
    code = request.GET.get('code')
    if not code:
        return Response({'error': 'code ausente'}, status=status.HTTP_400_BAD_REQUEST)

    token_url = f"{settings.MELHORENVIO_AUTH_BASE}/oauth/token"
    payload = {
        'grant_type': 'authorization_code',
        'client_id': settings.MELHORENVIO_CLIENT_ID,
        'client_secret': settings.MELHORENVIO_CLIENT_SECRET,
        'redirect_uri': settings.MELHORENVIO_REDIRECT_URI,
        'code': code,
    }
    try:
        resp = requests.post(token_url, data=payload, headers={'Accept': 'application/json'}, timeout=20)
    except requests.RequestException as e:
        return Response({'error': 'Falha na troca de token', 'details': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    if resp.status_code >= 400:
        return Response({'error': 'Erro na troca de token', 'status': resp.status_code, 'response': resp.text}, status=status.HTTP_502_BAD_GATEWAY)

    data = resp.json()
    _store_token(data)
    # Redirect back to a success page in frontend (cart to recalculate quotes)
    return redirect('http://localhost:5173/cart')
