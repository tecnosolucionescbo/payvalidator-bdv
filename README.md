# PayValidator BDV

Sistema de Validación de Pagos para el Banco de Venezuela (BDV).

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL + Storage + Realtime)
- **Hosting:** Vercel
- **Control de versiones:** GitHub

---

## 🚀 Setup paso a paso

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tu-usuario/payvalidator-bdv.git
cd payvalidator-bdv
npm install
```

### 2. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. En **Settings → API**, copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Secret key** (`sb_secret_...`) → `SUPABASE_SECRET_KEY`

### 3. Ejecutar migraciones SQL

En el **SQL Editor** de Supabase, ejecuta el contenido de:
```
supabase/migrations/001_initial_schema.sql
```

Luego, en la misma sesión, deshabilita RLS para pruebas:
```sql
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments_received DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_config DISABLE ROW LEVEL SECURITY;
```

### 4. Crear bucket en Storage

1. Ve a **Storage** en Supabase
2. Crea un bucket llamado `receipts`
3. Configúralo como **privado** (Private)

### 5. Configurar cron job (opcional pero recomendado)

En **Database → Extensions**, activa `pg_cron`.  
Luego en SQL Editor:
```sql
SELECT cron.schedule(
  'expire-orders',
  '*/5 * * * *',
  'SELECT expire_old_orders()'
);
```

### 6. Configurar variables de entorno

Copia `.env.local.example` a `.env.local` y rellena con tus datos:

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
ADMIN_SECRET_KEY=payvalidator-bdv-2026-secreto-admin-123456789
```

### 7. Probar en local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 8. Deploy en Vercel

1. Sube el código a GitHub
2. En Vercel, importa el repositorio
3. Agrega las variables de entorno en **Settings → Environment Variables**
4. Deploy

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage (/)
│   ├── globals.css             # Estilos globales
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── checkout/
│   │   │   └── page.tsx        # Checkout multi-step
│   │   └── status/
│   │       └── [ref]/
│   │           └── page.tsx    # Estado de la orden
│   └── (admin)/
│       ├── layout.tsx
│       ├── login/
│       │   └── page.tsx        # Login admin
│       └── dashboard/
│           └── page.tsx        # Panel admin
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── utils.ts                # Helpers (generateReference, formatBs...)
│   └── constants.ts            # BDV_BANK, status labels/colors
├── types/
│   └── index.ts                # TypeScript types
└── hooks/
    └── useRealtime.ts          # Hook Supabase Realtime
supabase/
└── migrations/
    └── 001_initial_schema.sql  # Tablas, funciones, cron
```

---

## 🔑 Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/checkout` | Checkout (3 pasos: form → instrucciones → subir comprobante) |
| `/status/[ref]` | Estado público de una orden |
| `/login` | Login admin |
| `/dashboard` | Panel de administración |

---

## 👤 Datos bancarios BDV

| Campo | Valor |
|-------|-------|
| Nombre | JUAN VICENTE CABEZA CALMA |
| Cédula | V-25036229 |
| Teléfono (Pago Móvil) | 0424-9403682 |
| Cuenta | 0102-0414310000438821 |
| Tipo | Corriente |
| Banco | Banco de Venezuela |

---

## 🔐 Acceso admin

- URL: `/login`
- Clave: `payvalidator-bdv-2026-secreto-admin-123456789`

---

## 📋 Flujo del sistema

1. **Cliente** entra a `/checkout`, llena el formulario y genera una orden
2. El sistema genera una **referencia única** (ej: `PM-260619-X3K7`)
3. El cliente ve las instrucciones con los datos bancarios y la referencia
4. El cliente realiza el pago y **sube la captura de pantalla** del comprobante
5. El comprobante queda en estado `review` en Supabase Storage
6. El **operador** entra al `/dashboard`, revisa el comprobante
7. El operador hace clic en **Confirmar** o **Rechazar**
8. El estado de la orden se actualiza en tiempo real
