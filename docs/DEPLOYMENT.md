# Deployment Dashboard IRIN v4

## Hosting: GitHub Pages (aktywny)

- **Repo:** `lukaszznojek-hue/irin-dashboard` (prywatne)
- **Branch:** main
- **Auto-deploy:** po każdym `git push origin main` (~1-2 min)

## Jak zaktualizować

```bash
cd "/Users/znojek/Mój dysk/Claudia/biznes_wlasny/irin/projekty/research_strategiczny/dashboard_v4"
git add .
git commit -m "Opis zmian"
git push origin main
# GitHub Pages automatycznie deployuje z main
```

## Jak sprawdzić status deploy

```bash
gh api repos/lukaszznojek-hue/irin-dashboard/pages --jq '.html_url'
```

## Alternatywy (gdyby GitHub Pages nie działało)

### Opcja B: Cloudflare Pages
1. Wejdź na dash.cloudflare.com → Pages → Create
2. Przeciągnij folder dashboard_v4/ (drag & drop)
3. Deploy w 30 sekund, URL: *.pages.dev

### Opcja C: Netlify Drop
1. Wejdź na app.netlify.com/drop
2. Przeciągnij folder dashboard_v4/
3. Deploy w 10 sekund, URL: *.netlify.app

### Opcja D: Lokalnie
```bash
cd dashboard_v4
python3 -m http.server 8000
# Otwórz http://localhost:8000
```

## Ważne

- Pliki `_zrodla/` i `_zrodla_v3/` NIE są pushowane (w .gitignore)
- Hasło strategii (`Wiktori@2026`) jest w kodzie JS - repo powinno być **prywatne**
- Logo IRIN w assets/img/ - upewnij się że SVG wyświetla się poprawnie
