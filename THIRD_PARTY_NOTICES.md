# Third-Party Notices

OrbitFabric Studio is licensed under Apache-2.0. It uses third-party dependencies under their own licenses.

This source repository does not vendor `node_modules`. Dependencies are retrieved by the package manager from the versions pinned by `package-lock.json`.

## Graph rendering and layout

### @xyflow/react 12.11.2

- Project: React Flow / xyflow
- License: MIT
- Repository: https://github.com/xyflow/xyflow

React Flow provides the interactive Context Map rendering primitives used by Studio.

### elkjs 0.11.1

- Project: ELK for JavaScript
- License: Eclipse Public License 2.0 (EPL-2.0)
- Repository: https://github.com/kieler/elkjs
- Version source: tag `0.11.1`

ELK computes layout positions for the Context Map. Studio does not modify ELK source code.

The first Studio Public Preview is a developer/source distribution and does not vendor ELK binaries or `node_modules`. A future packaged desktop distribution must include the notices and license material required by the applicable ELK license and re-check the exact bundled dependency versions at release time.

## Release rule

Before any packaged/binary Studio release:

1. regenerate a complete third-party dependency inventory from the release lockfiles;
2. include required copyright/license notices in the distribution;
3. re-check dependencies whose license changed between versions;
4. do not infer a package's license from the current upstream branch when Studio pins an older release.
