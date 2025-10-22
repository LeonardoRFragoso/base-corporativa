from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import DiscountCode
from .serializers import DiscountCodeSerializer


class DiscountValidateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        code = (request.query_params.get('code') or '').strip()
        if not code:
            return Response({"valid": False, "reason": "missing code"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            d = DiscountCode.objects.get(code__iexact=code, active=True)
        except DiscountCode.DoesNotExist:
            return Response({"valid": False, "reason": "not found"}, status=status.HTTP_200_OK)

        now = timezone.now()
        if d.valid_from and now < d.valid_from:
            return Response({"valid": False, "reason": "not yet valid"}, status=status.HTTP_200_OK)
        if d.valid_until and now > d.valid_until:
            return Response({"valid": False, "reason": "expired"}, status=status.HTTP_200_OK)
        if d.usage_limit and d.times_used >= d.usage_limit:
            return Response({"valid": False, "reason": "usage limit reached"}, status=status.HTTP_200_OK)

        return Response({
            "valid": True,
            "code": d.code,
            "percent_off": d.percent_off,
            "amount_off": d.amount_off,
        }, status=status.HTTP_200_OK)


class DiscountListCreateView(generics.ListCreateAPIView):
    queryset = DiscountCode.objects.all().order_by('-created_at')
    serializer_class = DiscountCodeSerializer
    permission_classes = [permissions.IsAdminUser]


class DiscountDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DiscountCode.objects.all()
    serializer_class = DiscountCodeSerializer
    permission_classes = [permissions.IsAdminUser]
