@AGENTS.md

## Específico de Claude Code

- Responder en español; código y comentarios en inglés (ver Convenciones).
- Para cambios no triviales usar plan mode y esperar `APROBAR` antes de editar.
- Verificación mínima antes de dar algo por terminado: `npx jest` y `npx tsc --noEmit` (comparar contra los 5 errores legacy conocidos).
- Permisos compartidos del equipo en `.claude/settings.json`; preferencias personales en `.claude/settings.local.json` (ignorado por git).
