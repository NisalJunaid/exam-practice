# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Exam practice app setup notes

### Local frontend setup

1. Install dependencies with `npm install`.
2. Create a `.env.local` file if needed and set `VITE_API_BASE_URL=http://127.0.0.1:8000/api`.
3. Start the Laravel backend before using authenticated flows.
4. Run `npm run build` or `npx tsc -b` after integration changes to catch API/type mismatches early.

### Integration expectations

* Student routes assume the backend returns attempt status updates from `/student/attempts/:id`, including the post-submission polling states used by the marking progress page.
* Admin import review expects backend summary keys like `matchedItems`, `paperOnlyItems`, `schemeOnlyItems`, `ambiguousItems`, `resolvedItems`, and `totalItems`.
* Completed imports now surface the backend status value `approved`, which the admin review UI treats as the terminal import state.
