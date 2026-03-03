#!/bin/bash

# Script para criar índices customizados de performance
# Execute com: bash create_custom_indexes.sh

echo "🔧 Criando índices customizados de performance..."
echo ""

# Ativar ambiente virtual
source venv/bin/activate

# Executar comando
python3 manage.py create_indexes

echo ""
echo "✅ Script finalizado!"
