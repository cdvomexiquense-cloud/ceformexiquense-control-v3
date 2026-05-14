# Estructura de la base de datos (MongoDB)

MongoDB es una base de datos NoSQL: **no necesitas crear tablas ni correr
migraciones**. Las colecciones se crean automaticamente al insertar el primer
documento desde la app.

Aun asi, aqui esta el esquema logico que usa el sistema para que sepas que se
guarda y como.

## Coleccion: `categories`

Categorias de la academia (Sub-10, Sub-12, Primera fuerza, etc.).

```js
{
  id: "uuid-v4",              // Identificador unico (string)
  name: "Sub-12",             // Nombre visible
  monthly_fee: 600,           // Cuota mensual (numero)
  color: "#22c55e",           // Color hex para la UI
  created_at: "2026-05-10T12:00:00.000Z"
}
```

## Coleccion: `players`

Jugadores inscritos en la academia.

```js
{
  id: "uuid-v4",
  name: "Juan Perez",
  category_id: "uuid-categoria", // Referencia a categories.id (puede ser null)
  phone: "5555555555",
  parent_name: "Maria Lopez",
  birthdate: "2014-03-15",       // YYYY-MM-DD
  monthly_fee_override: null,    // Si no es null, sobreescribe la cuota de la categoria
  photo_url: "",
  active: true,                  // false = ya no esta inscrito
  created_at: "2026-05-10T12:00:00.000Z"
}
```

## Coleccion: `payments`

Un documento por jugador, mes y ano.

```js
{
  id: "uuid-v4",
  player_id: "uuid-jugador",  // Referencia a players.id
  month: 5,                   // 1-12
  year: 2026,
  amount: 600,                // Monto a cobrar
  status: "paid",             // "paid" o "pending"
  payment_method: "efectivo", // efectivo / transferencia / tarjeta / etc.
  notes: "",
  paid_date: "2026-05-10T12:00:00.000Z", // null si pendiente
  created_at: "2026-05-01T00:00:00.000Z"
}
```

## Indices recomendados (opcional)

Si tu base crece a miles de registros, conecta a MongoDB y corre:

```js
db.players.createIndex({ id: 1 }, { unique: true })
db.categories.createIndex({ id: 1 }, { unique: true })
db.payments.createIndex({ id: 1 }, { unique: true })
db.payments.createIndex({ player_id: 1 })
db.payments.createIndex({ year: 1, month: 1 })
db.payments.createIndex({ status: 1 })
```

No es obligatorio para el MVP. La app funciona sin ellos.

## Equivalencia con SQL (por si prefieres entenderlo asi)

Si vinieras de SQL, equivaldria a esto:

```sql
CREATE TABLE categories (
  id           VARCHAR(36) PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  monthly_fee  DECIMAL(10,2) NOT NULL DEFAULT 0,
  color        VARCHAR(7) DEFAULT '#22c55e',
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE players (
  id                   VARCHAR(36) PRIMARY KEY,
  name                 VARCHAR(150) NOT NULL,
  category_id          VARCHAR(36) REFERENCES categories(id),
  phone                VARCHAR(20),
  parent_name          VARCHAR(150),
  birthdate            DATE,
  monthly_fee_override DECIMAL(10,2),
  photo_url            TEXT,
  active               BOOLEAN DEFAULT TRUE,
  created_at           TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
  id              VARCHAR(36) PRIMARY KEY,
  player_id       VARCHAR(36) REFERENCES players(id) ON DELETE CASCADE,
  month           INT NOT NULL,
  year            INT NOT NULL,
  amount          DECIMAL(10,2) NOT NULL DEFAULT 0,
  status          VARCHAR(10) NOT NULL DEFAULT 'pending',
  payment_method  VARCHAR(50),
  notes           TEXT,
  paid_date       TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

Pero en MongoDB nada de esto es necesario: solo configura `MONGO_URL` y la app
se encarga.
