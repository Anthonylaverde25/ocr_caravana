@./AGENTS.md

## Específico de Gemini CLI / Antigravity

- Responder en español; código y comentarios en inglés (ver Convenciones).
- Para cambios no triviales, presentar el plan y esperar `APROBAR` antes de editar archivos.
- Verificación mínima antes de dar algo por terminado: `npx jest` y `npx tsc --noEmit` (comparar contra los 5 errores legacy conocidos).
- `.geminiignore` excluye las carpetas generadas (`ios/`, `android/`, `node_modules/`, `.venv`).
