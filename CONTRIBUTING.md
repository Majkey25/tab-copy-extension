# Contributing

Keep changes small, readable, and directly related to Tab Copy.

## Before opening a pull request

1. Run `npm test`.
2. Load the extension through `chrome://extensions` or `edge://extensions`.
3. Test individual selection, `Shift + Click` range selection, `ALL`, `NONE`, and `COPY`.
4. Avoid adding frameworks or dependencies unless they solve a concrete problem that plain JavaScript cannot solve cleanly.
5. Keep the interface black, white, restrained, and accessible.

## Commit style

Use Conventional Commits when practical.

```text
feat: add keyboard range selection
fix: preserve tab order when copying
chore: update documentation
```
