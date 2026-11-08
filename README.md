# TakeHelp? frontend (React + Vite)
## Run locally
    npm install && cp .env.example .env   # edit VITE_API_URL
    npm run dev
## .env
    VITE_API_URL=https://YOUR-RENDER-BACKEND-URL   (no trailing slash)
## Connect the Render backend
Set the backend's CORS allowed origin to your Vercel URL (and http://localhost:5173) with credentials enabled.
Endpoints the frontend calls (JSON, Bearer token or httpOnly cookie):
- GET /api/config -> {maxActive, activeOrders, minDays, minOrder}
- POST /api/auth/register|login {name?,email,password} -> {user:{name,role}, token?}; POST /api/auth/logout; GET /api/auth/me -> {user}
- POST /api/uploads (multipart "file") -> {fileId}
- POST /api/orders/quote -> {estimate}; POST /api/orders -> order (409 when full, 422 bad date)
- GET /api/orders -> {orders}; GET /api/orders/:id
- GET /api/admin/stats|orders?sort=due|price|pages|diagrams|newest|oldest|orders/:id; PATCH /api/admin/orders/:id {status,finalPrice,priority,adminMessage}
- GET/PUT /api/admin/pricing {perPage,perDrawing,perTable,perGraph,perSimpleDiagram,perDetailedDiagram}; GET/PUT /api/admin/settings {maxActive,minDays,minOrder}
The backend must re-check price, the 6-day rule, the 15-slot limit and admin role on every request.
## Deploy to Vercel
Push to GitHub, import in Vercel (framework: Vite, build `npm run build`, output `dist`), add VITE_API_URL, deploy. vercel.json already handles SPA routing.
## Environment variables
VITE_API_URL only. Never put secrets in the frontend.
