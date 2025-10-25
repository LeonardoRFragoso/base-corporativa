# Design System - BASE CORPORATIVA

## Identidade Visual

### Logo
A logo da BASE CORPORATIVA apresenta:
- Formas geométricas hexagonais que transmitem solidez e profissionalismo
- Cor principal: Dourado elegante (#D4A574)
- Fundo: Preto (#000000)
- Tagline: "Conforto e praticidade diária"

### Paleta de Cores

#### Primary (Dourado Elegante)
Cor principal extraída da logo, usada para elementos de destaque e branding.

```css
primary-50:  #fdfaf5
primary-100: #faf4e8
primary-200: #f5e8cd
primary-300: #ead7a8
primary-400: #ddc182
primary-500: #d4a574  /* Tom principal da logo */
primary-600: #c89558
primary-700: #b07d45
primary-800: #8f653a
primary-900: #745332
primary-950: #3e2b19
```

**Uso:**
- Badges e categorias
- Ícones e elementos decorativos
- Bordas de cards
- Hover states em links
- Gradientes de fundo

#### Bronze (Marrom Escuro)
Cor secundária para CTAs e botões principais, transmite confiança e ação.

```css
bronze-50:  #faf7f5
bronze-100: #f0ebe5
bronze-200: #e0d4c9
bronze-300: #cab6a4
bronze-400: #b4957f
bronze-500: #9d7a63
bronze-600: #8a6651
bronze-700: #735345
bronze-800: #5d2e0f  /* Tom dos botões principais */
bronze-900: #4a2812
bronze-950: #2a1608
```

**Uso:**
- Botões de ação primária (Login, Registro, Comprar)
- CTAs importantes
- Elementos de navegação ativos
- Ícones de features secundárias

#### Dark (Preto/Cinza)
Cores neutras para fundos escuros e texto.

```css
dark-50:  #f6f6f6
dark-900: #3d3d3d
dark-950: #0a0a0a  /* Preto da logo */
```

#### Neutral (Cinzas)
Cores neutras para texto, bordas e fundos.

```css
neutral-50:  #fafafa
neutral-100: #f5f5f5
neutral-200: #e5e5e5
neutral-600: #525252
neutral-700: #404040
```

### Tipografia

#### Fontes

**Display/Títulos:** Playfair Display
- Fonte serifada elegante
- Usada em todos os títulos principais (h1, h2, h3)
- Transmite sofisticação e elegância
- Classe: `font-display`

**Corpo de Texto:** Inter
- Fonte sans-serif moderna e legível
- Usada em parágrafos, botões, labels
- Classe: `font-sans` (padrão)

#### Hierarquia

```css
h1: text-4xl sm:text-5xl lg:text-6xl font-display font-bold
h2: text-3xl lg:text-4xl font-display font-bold
h3: text-xl font-semibold
body: text-base font-sans
```

### Componentes

#### Botões

**Primário (CTA Principal):**
```jsx
className="bg-bronze-800 text-white hover:bg-bronze-700"
```
Uso: Login, Registro, Comprar, Finalizar compra

**Secundário (Outline):**
```jsx
className="border border-primary-500 text-primary-700 hover:bg-primary-50"
```
Uso: Ver detalhes, Ações secundárias

**Terciário (Ghost):**
```jsx
className="text-neutral-600 hover:bg-primary-50 hover:text-primary-700"
```
Uso: Sair, Cancelar

#### Cards

**Borda Superior Colorida:**
```jsx
className="border-t-4 border-primary-500"  // ou bronze-700, primary-600
```

**Sombras:**
```jsx
shadow-soft       // Sombra suave
shadow-medium     // Sombra média
shadow-strong     // Sombra forte
```

#### Badges

**Categoria:**
```jsx
className="bg-primary-500/90 text-white"
```

**Status:**
```jsx
className="bg-error-500 text-white"  // Esgotado
className="bg-success-500 text-white"  // Disponível
```

### Gradientes

**Hero Background:**
```jsx
className="bg-gradient-to-br from-dark-950 via-dark-900 to-bronze-900"
```

**Botões com Gradiente (evitar, preferir sólido):**
```jsx
className="bg-gradient-to-r from-primary-500 to-primary-600"
```

### Espaçamentos

**Seções:**
- py-24: Seções principais
- py-20: Seções secundárias
- py-32: Hero sections

**Cards:**
- p-8: Padding interno de cards
- gap-8: Espaçamento entre cards

### Animações

**Hover States:**
```jsx
hover:-translate-y-1  // Elevação suave
hover:scale-105       // Aumento suave
```

**Transições:**
```jsx
transition-all duration-300  // Transição padrão
transition-all duration-200  // Transição rápida
```

**Animações Customizadas:**
```jsx
animate-fade-in     // Fade in suave
animate-scale-in    // Scale in
animate-float       // Flutuação suave (logo)
```

## Princípios de Design

1. **Minimalismo:** Design clean e sofisticado
2. **Elegância:** Uso de dourado e tipografia serifada
3. **Profissionalismo:** Cores sóbrias e layout estruturado
4. **Consistência:** Uso consistente de cores e espaçamentos
5. **Acessibilidade:** Contraste adequado e hierarquia clara

## Exemplos de Uso

### Hero Section
```jsx
<section className="bg-gradient-to-br from-dark-950 via-dark-900 to-bronze-900">
  <h1 className="font-display font-bold text-white">BASE CORPORATIVA</h1>
  <button className="bg-bronze-800 text-white hover:bg-bronze-700">
    Ver catálogo
  </button>
</section>
```

### Feature Card
```jsx
<div className="bg-white rounded-xl p-8 shadow-soft hover:shadow-medium border-t-4 border-primary-500">
  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
    {/* Icon */}
  </div>
  <h3 className="text-xl font-semibold text-dark-900">Título</h3>
  <p className="text-neutral-600">Descrição</p>
</div>
```

### Product Card
```jsx
<div className="bg-white rounded-lg shadow-soft hover:shadow-medium">
  <div className="bg-primary-500/90 text-white">Categoria</div>
  <button className="bg-bronze-800 text-white hover:bg-bronze-700">
    Comprar
  </button>
</div>
```

## Atualizações Recentes

### Outubro 2025
- ✅ Atualizada paleta de cores para refletir o dourado elegante da logo
- ✅ Substituído laranja por dourado (#d4a574) como cor primary
- ✅ Adicionado marrom escuro (#5d2e0f) para botões de ação
- ✅ Implementada fonte Playfair Display para títulos
- ✅ Mantida Inter para corpo de texto
- ✅ Ajustados todos os componentes principais (Navbar, Home, Login, Register, ProductCard)
- ✅ Padronizados gradientes e sombras
