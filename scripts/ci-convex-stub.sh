#!/usr/bin/env bash
# Stub out convex/_generated for CI typecheck.
#
# Convex generates _generated/ from a live deployment (CONVEX_DEPLOYMENT env),
# which isn't available in a pull-request CI job. This script writes minimal
# type-erased stubs so `tsc --noEmit` can resolve the imports without running
# a real `npx convex codegen` or requiring a deploy key in CI.
#
# Types are intentionally `any` — the goal of CI typecheck is to catch errors
# in app code, not Convex function signatures (those are checked locally via
# the real codegen when the dev runs `npx convex dev`).

set -e

DIR="convex/_generated"
mkdir -p "$DIR"

cat > "$DIR/api.d.ts" <<'EOF'
export declare const api: any
export declare const internal: any
EOF

cat > "$DIR/api.js" <<'EOF'
import { anyApi } from 'convex/server'

export const api = anyApi
export const internal = anyApi
EOF

cat > "$DIR/server.d.ts" <<'EOF'
export {
  mutation,
  query,
  internalMutation,
  internalQuery,
  action,
  internalAction,
  httpAction,
} from 'convex/server'
export type MutationCtx = any
export type QueryCtx = any
export type ActionCtx = any
export type DataModel = any
EOF

cat > "$DIR/server.js" <<'EOF'
export {
  mutation,
  query,
  internalMutation,
  internalQuery,
  action,
  internalAction,
  httpAction,
} from 'convex/server'
EOF

cat > "$DIR/dataModel.d.ts" <<'EOF'
export type Doc<T extends string = string> = any
export type Id<T extends string = string> = string
export type DataModel = any
EOF

echo "Convex _generated stubs written to $DIR"
