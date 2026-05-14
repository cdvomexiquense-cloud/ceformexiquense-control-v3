# Guia para publicar AcademiaPro en internet - GRATIS

Esta guia esta hecha para ti aunque no sepas **NADA** de programacion ni de servidores.
Vamos a poner tu app en internet, gratis, en aproximadamente **30 minutos**.

Vas a usar tres servicios, todos con plan gratuito de por vida:

1. **GitHub** - para guardar tu codigo (gratis).
2. **MongoDB Atlas** - tu base de datos en la nube (gratis hasta 512 MB).
3. **Vercel** - el hosting donde vive tu app (gratis hasta 100 GB de trafico/mes).

NO necesitas tarjeta de credito para ninguno.

---

## Paso 0 - Instalar lo basico (5 min)

Antes de empezar, instala estos dos programas gratis en tu computadora:

1. **Node.js** version 18 o superior:
   - Ve a https://nodejs.org/es
   - Descarga la version "LTS" (la verde) y ejecuta el instalador.
   - Acepta todo con "Siguiente". Listo.

2. **Git** (para subir tu codigo):
   - Ve a https://git-scm.com/downloads
   - Descarga e instala. Acepta todo lo predeterminado.

Para verificar que se instalaron bien:
- En Windows: abre **PowerShell** (busca "PowerShell" en el menu inicio).
- En Mac: abre **Terminal** (Cmd+Space, escribe "terminal").
- Escribe estos dos comandos, uno por uno:

```bash
node --version
git --version
```

Si te muestra un numero de version en cada uno, todo bien.

---

## Paso 1 - Descomprime el proyecto (1 min)

1. Descomprime el archivo **academia-pro.zip** que te enviaron en una carpeta,
   por ejemplo en tu Escritorio. Te quedara una carpeta llamada `academia-pro`.

2. Abre la terminal/PowerShell y entra a esa carpeta:

```bash
cd Desktop/academia-pro
```

(Cambia `Desktop` por la ruta donde la pusiste).

---

## Paso 2 - Crea tu base de datos en MongoDB Atlas (10 min)

1. Ve a https://www.mongodb.com/cloud/atlas/register

2. Registrate con tu correo o con Google. Es **gratis** y NO pide tarjeta.

3. Cuando entres, te preguntara que quieres construir. Elige:
   - "Build a database"
   - Selecciona el plan **M0 - FREE** (el primero, dice $0/month).
   - Provider: deja **AWS**.
   - Region: elige la mas cercana a ti (por ejemplo `us-east-1` o `sa-east-1`).
   - Cluster Name: dejalo como esta (`Cluster0`).
   - Click en **Create Deployment**.

4. Te pedira crear un **usuario de la base de datos**:
   - Username: `admin` (o el que quieras).
   - Password: pon una contrasena fuerte y **COPIALA EN UN BLOC DE NOTAS** porque la
     vas a necesitar despues.
   - Click en **Create User**.

5. Te pedira **Add IP Access**. Click en **Add My Current IP Address** y tambien:
   - Click en **Add a Different IP Address**.
   - Pon: `0.0.0.0/0` (esto permite que Vercel se conecte desde cualquier parte).
   - Description: `Vercel`.
   - Click en **Add Entry**.
   - Click en **Finish and Close**.

6. Click en **Done**. Espera 2-3 minutos a que tu cluster este "Active".

7. Ahora obten la cadena de conexion:
   - Click en **Connect** (boton al lado de Cluster0).
   - Elige **Drivers**.
   - Driver: **Node.js**, Version: la mas reciente.
   - Te dara una linea como esta:
     ```
     mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority\n     ```
   - **COPIALA en un bloc de notas**.
   - Reemplaza `<password>` por la contrasena que pusiste en el paso 4.
   - Agrega el nombre de la base de datos. Quedaria asi:
     ```
     mongodb+srv://admin:TUPASSWORD@cluster0.xxxxx.mongodb.net/academia_futbol?retryWrites=true&w=majority\n     ```
   - **Guarda esa cadena completa**, la vas a usar en el paso 5.

---

## Paso 3 - Sube tu codigo a GitHub (5 min)

1. Ve a https://github.com y crea una cuenta gratis (si no tienes).

2. Una vez dentro, click en el **+** arriba a la derecha → **New repository**.
   - Repository name: `academia-pro`
   - Visibilidad: **Private** (recomendado) o Public.
   - **NO** marques "Add a README".
   - Click en **Create repository**.

3. Te aparecera una pagina con comandos. Copia los siguientes y pegalos en tu
   terminal (estando dentro de la carpeta `academia-pro`):

```bash
git init
git add .
git commit -m "Primera version"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/academia-pro.git
git push -u origin main
```

Cambia `TU-USUARIO` por tu nombre de usuario de GitHub. La primera vez te pedira
iniciar sesion en GitHub - hazlo desde la ventana que se abre.

Si todo salio bien, refresca la pagina de GitHub y veras todos los archivos del
proyecto.

---

## Paso 4 - Publica en Vercel (10 min)

1. Ve a https://vercel.com/signup

2. Click en **Continue with GitHub** y autoriza el acceso.

3. Una vez dentro, click en **Add New** → **Project**.

4. Veras la lista de repos de tu GitHub. Busca `academia-pro` y click en **Import**.

5. En la pagina de configuracion:
   - **Framework Preset**: Next.js (lo detectara solo).
   - **Root Directory**: dejalo en blanco (raiz).
   - **Build and Output Settings**: dejalo predeterminado.

6. Expande la seccion **Environment Variables** y agrega estas 5 variables
   (click en "Add" por cada una):

   | Name                   | Value                                                         |\n   |------------------------|---------------------------------------------------------------|\n   | `MONGO_URL`            | (la cadena que copiaste de MongoDB Atlas en el Paso 2)        |\n   | `DB_NAME`              | `academia_futbol`                                             |\n   | `NEXT_PUBLIC_BASE_URL` | dejala vacia por ahora, la editas despues                     |\n   | `ADMIN_USERNAME`       | `admin` (o el usuario que quieras)                            |\n   | `ADMIN_PASSWORD`       | una contrasena fuerte (la vas a usar para entrar a la app)    |\n   | `AUTH_SECRET`          | una cadena aleatoria larga, p.ej. `mi-super-secreto-123456789abcdef` |\n\n   Importante: NO uses comillas en los valores.\n\n7. Click en **Deploy**.\n\n8. Espera 2-3 minutos. Cuando termine, te mostrara una pantalla con\n   **Congratulations** y un link tipo `https://academia-pro-xxxx.vercel.app`.\n\n9. Click en **Visit** o en el link. Veras tu app funcionando.\n\n10. (Opcional) Actualiza `NEXT_PUBLIC_BASE_URL`:\n    - Ve a **Settings** → **Environment Variables** dentro del proyecto.\n    - Edita `NEXT_PUBLIC_BASE_URL` y pon la URL que te dio Vercel.\n    - Ve a la pestana **Deployments** → click en los tres puntos del ultimo deployment\n      → **Redeploy**.\n\n---\n\n## Paso 5 - Primer uso\n\n1. Abre la URL que te dio Vercel.\n\n2. Inicia sesion con:\n   - Usuario: el que pusiste en `ADMIN_USERNAME`\n   - Contrasena: la que pusiste en `ADMIN_PASSWORD`\n\n3. Crea **al menos una categoria** primero (por ejemplo \"Sub-12\" con cuota 600).\n\n4. Crea **jugadores** y asignales su categoria.\n\n5. Ve a **Pagos** → click en **Generar mensualidad** → elige mes y ano. Se crearan\n   automaticamente los pagos pendientes de todos los jugadores activos.\n\n6. Conforme cobres, marca cada pago como **pagado**.\n\n¡Listo! Tu sistema ya esta en internet y lo puedes abrir desde tu celular,\ntablet o cualquier computadora.\n\n---\n\n## Como actualizar la app cuando hagas cambios\n\nCualquier cambio que hagas en el codigo y subas a GitHub, Vercel lo publica\nautomaticamente. Solo:\n\n```bash\ngit add .\ngit commit -m \"Mis cambios\"\ngit push\n```\n\nY en 1-2 minutos los cambios estan en linea. Vercel te avisa por correo.\n\n---\n\n## Como agregar un dominio propio (opcional, ~$10 USD/ano)\n\nSi quieres `miacademia.com` en lugar de `academia-pro-xxxx.vercel.app`:\n\n1. Compra el dominio en Namecheap, GoDaddy, etc. (~$10 USD/ano).\n2. En Vercel: Project → Settings → Domains → Add → escribe tu dominio.\n3. Vercel te dira que registros DNS poner. Pegalos en tu proveedor de dominio.\n4. En 1-24 horas estara activo. El certificado SSL (https) es automatico y gratis.\n\n---\n\n## Problemas comunes\n\n**\"Cannot connect to MongoDB\"**\n- Revisa que en MongoDB Atlas → Network Access este `0.0.0.0/0`.\n- Verifica que reemplazaste `<password>` por la contrasena real en `MONGO_URL`.\n- Asegurate de que la cadena termine con `/academia_futbol?retryWrites=...`.\n\n**\"401 No autenticado\"**\n- Cierra sesion y vuelve a entrar.\n- Verifica que `ADMIN_USERNAME` y `ADMIN_PASSWORD` esten bien escritos en Vercel.\n\n**\"La app no carga / pantalla en blanco\"**\n- En Vercel → Deployments → click en el ultimo deployment → Function Logs.\n- Veras el error exacto. Lo mas comun es `MONGO_URL` mal escrita.\n\n**\"Olvide mi contrasena de admin\"**\n- En Vercel → Settings → Environment Variables → edita `ADMIN_PASSWORD`.\n- Redeploy el proyecto. Listo.\n\n---\n\n## Resumen rapido\n\n| Servicio       | Para que          | Costo     |\n|----------------|-------------------|-----------|\n| Node.js + Git  | Herramientas      | Gratis    |\n| GitHub         | Guardar codigo    | Gratis    |\n| MongoDB Atlas  | Base de datos     | Gratis (512 MB) |\n| Vercel         | Hosting de la app | Gratis (100 GB/mes) |\n| Dominio propio | URL bonita        | Opcional ~$10/ano |\n\nTotal para empezar: **$0**.\n\nSi algo no funciona, lee el log del deployment en Vercel: ahi siempre esta el\nerror exacto.\n\nMucho exito.\n", "overwrite": "true"}