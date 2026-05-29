#!/bin/bash
# Sincroniza los docs clave del repo al vault Obsidian de Roberto.
# Uso: ./scripts/sync-to-vault.sh

set -e

VAULT_PATH="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Roberto Vault/sopadeletras®/FC Agency/admin-fcagency"
REPO_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mkdir -p "$VAULT_PATH"

DOCS=(
  "HANDOFF.md"
  "CLAUDE.md"
  "README.md"
  "ARQUITECTURA.md"
  "DESCUBRIMIENTOS.md"
  "PRODUCCION.md"
  "PLAN.md"
  "PREGUNTAS-FELY.md"
)

echo "Sincronizando docs admin-fcagency → vault Obsidian..."
for doc in "${DOCS[@]}"; do
  if [ -f "$REPO_PATH/$doc" ]; then
    cp "$REPO_PATH/$doc" "$VAULT_PATH/$doc"
    echo "  ✓ $doc"
  fi
done

# Index file en el vault apuntando al repo
cat > "$VAULT_PATH/00 - Índice.md" <<EOF
# admin-fcagency — Docs sincronizados

> Espejo de los docs en GitHub. **Fuente de verdad: el repo.**
> No edites estos archivos directamente; cambia en el repo y corre \`./scripts/sync-to-vault.sh\`.
>
> Última sincronización: $(date '+%Y-%m-%d %H:%M')

- [[HANDOFF]] — setup desde cero, comandos, troubleshooting
- [[CLAUDE]] — convenciones para Claude Code
- [[ARQUITECTURA]] — diagrama y decisiones técnicas
- [[DESCUBRIMIENTOS]] — análisis de las 4 plataformas viejas
- [[PRODUCCION]] — estado vivo, URLs, IDs
- [[PLAN]] — roadmap por fases
- [[PREGUNTAS-FELY]] — decisiones pendientes con la dueña

## URL pública del HANDOFF (para Claude Code en cualquier Mac)

\`\`\`
https://raw.githubusercontent.com/pradofox/admin-fcagency/main/HANDOFF.md
\`\`\`

## Repo

https://github.com/pradofox/admin-fcagency

## Producción

https://admin.fcagency.mx
EOF

echo "  ✓ 00 - Índice.md (regenerado)"
echo ""
echo "Vault sincronizado en: $VAULT_PATH"
