# PEP 440 Specifier Helper

Single-page static helper for understanding and comparing Python package version specifiers.
It runs entirely in the browser: no Python install, build step, server, or package manager is required.

## Run

Open [index.html](index.html) directly in a modern browser.

The tool has two workflows:

- Explain a specifier such as `~=4.1`, `>=1.20,<2.0`, or `==1.2.*`.
- Compare two specifiers and inspect whether their accepted version ranges appear equivalent.

## Supported specifiers

The helper supports practical PEP 440 release-version constraints:

- Equality and inequality: `==`, `!=`
- Ordered comparisons: `<`, `<=`, `>`, `>=`
- Compatible releases: `~=`
- Wildcard equality such as `==1.2.*`
- Comma-separated specifier lists, interpreted as logical AND

## Notes and limitations

The implementation focuses on common integer release segments such as `1`, `1.2`, and `1.2.3`.
Pre-releases, development releases, post releases, epochs, and local version labels are intentionally ignored for simplicity.

For complex comparisons where a complete proof is not practical in the browser, the tool uses dense sampling and shows example versions where the specifiers differ.
