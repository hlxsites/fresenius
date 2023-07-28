[![Add to Sidekick](https://img.shields.io/badge/Franklin-Sidekick-%23F15A3A?style=for-the-badge&logo=data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI0LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxNiAxNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTYgMTY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRjE1QTNBO30KCS5zdDF7ZmlsbDojQzcxRjNEO30KCS5zdDJ7ZmlsbDojRkZDNDBDO30KPC9zdHlsZT4KPGc+Cgk8Y2lyY2xlIGNsYXNzPSJzdDAiIGN4PSIxLjciIGN5PSI4IiByPSIxLjciLz4KCTxjaXJjbGUgY2xhc3M9InN0MCIgY3g9IjE0LjMiIGN5PSI4IiByPSIxLjciLz4KCTxjaXJjbGUgY2xhc3M9InN0MSIgY3g9IjQuNyIgY3k9IjIiIHI9IjIiLz4KCTxjaXJjbGUgY2xhc3M9InN0MiIgY3g9IjEyIiBjeT0iMiIgcj0iMS4zIi8+Cgk8Y2lyY2xlIGNsYXNzPSJzdDEiIGN4PSIxMiIgY3k9IjE0IiByPSIyIi8+Cgk8Y2lyY2xlIGNsYXNzPSJzdDIiIGN4PSI0LjciIGN5PSIxNCIgcj0iMS4zIi8+CjwvZz4KPC9zdmc+Cg==)](https://www.hlx.live/tools/sidekick/?project=&from=&giturl=https%3A%2F%2Fgithub.com%2Fhlxsites%2Ffresenius%2Ftree%2Fmain)

# Fresenius Franklin Site

## Original site URLs 
- https://www.freseniusmedicalcare.com/en/home
- https://www.freseniusmedicalcare.com/en/patients-families-overview
- https://www.freseniusmedicalcare.com/en/dialysis-options

## Environments
- Preview: https://main--fresenius--hlxsites.hlx.page/
- Live: https://main--fresenius--hlxsites.hlx.live/

## Installation

```sh
npm i
```


## Tests

```sh
npm tst
```
```sh
npm run lint
```


## Local development

1. Create a new repository based on the `helix-project-boilerplate` template and add a mountpoint in the `fstab.yaml`
2. Add the [helix-bot](https://github.com/apps/helix-bot) to the repository
3. Install the [Helix CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/helix-cli`
4. Start Franklin Proxy: `hlx up` (opens your browser at `http://localhost:3000`)
5. Open the `{repo}` directory in your favorite IDE and start coding :)
